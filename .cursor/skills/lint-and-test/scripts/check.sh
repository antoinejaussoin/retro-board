#!/usr/bin/env bash
# CI lint/tests from .github/workflows/ci.yml, then the PR integration job
# from .github/workflows/e2e.yml.
# Usage: check.sh [all|ci|frontend|backend|marketing|docs|integration]
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
MODE=${1:-all}

case "$MODE" in
  all | ci | frontend | backend | marketing | docs | integration) ;;
  *)
    echo "usage: $0 [all|ci|frontend|backend|marketing|docs|integration]" >&2
    exit 2
    ;;
esac

port_open() {
  python3 - "$1" <<'PY'
import socket, sys
port = int(sys.argv[1])
s = socket.socket()
s.settimeout(1)
try:
    s.connect(("127.0.0.1", port))
except OSError:
    sys.exit(1)
finally:
    s.close()
PY
}

postgres_ready() {
  PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d postgres -c 'SELECT 1' >/dev/null 2>&1
}

redis_ready() {
  python3 - <<'PY'
import socket, sys
s = socket.create_connection(("127.0.0.1", 6379), 2)
s.settimeout(2)
s.sendall(b"PING\r\n")
data = s.recv(64)
sys.exit(0 if b"PONG" in data else 1)
PY
}

wait_until() {
  local label=$1
  shift
  local i
  for i in $(seq 1 40); do
    if "$@"; then
      return 0
    fi
    sleep 1
  done
  echo "$label did not become ready" >&2
  return 1
}

ensure_postgres() {
  if postgres_ready; then
    return 0
  fi
  if port_open 5432; then
    echo "127.0.0.1:5432 is open, but postgres/postgres cannot query database postgres." >&2
    echo "Backend tests need that login. Not starting a second Postgres." >&2
    return 1
  fi
  if docker ps -a --format '{{.Names}}' | grep -qx 'retro-lint-postgres'; then
    docker start retro-lint-postgres >/dev/null
  else
    docker run -d --name retro-lint-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=postgres \
      -p 5432:5432 \
      postgres:16 >/dev/null
  fi
  wait_until "Postgres" postgres_ready
}

ensure_redis() {
  if redis_ready; then
    return 0
  fi
  if port_open 6379; then
    echo "127.0.0.1:6379 is open but did not answer PING. Not starting a second Redis." >&2
    return 1
  fi
  if docker ps -a --format '{{.Names}}' | grep -qx 'retro-lint-redis'; then
    docker start retro-lint-redis >/dev/null
  else
    docker run -d --name retro-lint-redis -p 6379:6379 redis:7 >/dev/null
  fi
  wait_until "Redis" redis_ready
}

suite_frontend() {
  echo "== frontend: npm ci, ci-test, ci-lint, build"
  (
    cd "$ROOT/frontend"
    npm ci
    npm run ci-test
    npm run ci-lint
    npm run build
  )
}

suite_backend() {
  echo "== backend: fmt, clippy, build, test"
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql is not on PATH. Backend tests shell out to it." >&2
    return 1
  fi
  ensure_postgres
  ensure_redis
  (
    cd "$ROOT/backend"
    cargo fmt --check
    cargo clippy -p retrospected-server -p retrospected-migrations --all-targets -- -D warnings
    cargo build -p retrospected-server
    cargo test --workspace
  )
}

suite_marketing() {
  echo "== marketing: npm ci, ci-lint, build"
  (
    cd "$ROOT/marketing"
    npm ci
    npm run ci-lint
    npm run build
  )
}

suite_docs() {
  echo "== docs: npm ci, typecheck, build"
  (
    cd "$ROOT/docs"
    npm ci
    npm run typecheck
    npm run build
  )
}

suite_integration() {
  echo "== integration: build images, cypress"
  (
    cd "$ROOT"
    docker build -f backend/Dockerfile -t retro-backend:local backend
    docker build -f frontend/Dockerfile -t retro-frontend:local frontend
    cleanup() {
      docker compose -f integration/docker-compose.local.local.yml down -v
    }
    trap cleanup EXIT
    docker compose -f integration/docker-compose.local.local.yml up --exit-code-from cypress
  )
}

run_suite() {
  local name=$1
  shift
  if "$@"; then
    echo "== pass: $name"
    return 0
  fi
  echo "== fail: $name" >&2
  return 1
}

status=0
run_ci=0
case "$MODE" in
  all | ci) run_ci=1 ;;
esac

if [[ "$MODE" == "frontend" || "$run_ci" == "1" ]]; then
  run_suite frontend suite_frontend || status=1
fi
if [[ "$MODE" == "backend" || "$run_ci" == "1" ]]; then
  run_suite backend suite_backend || status=1
fi
if [[ "$MODE" == "marketing" || "$run_ci" == "1" ]]; then
  run_suite marketing suite_marketing || status=1
fi
if [[ "$MODE" == "docs" || "$run_ci" == "1" ]]; then
  run_suite docs suite_docs || status=1
fi

if [[ "$MODE" == "integration" ]]; then
  run_suite integration suite_integration || status=1
elif [[ "$MODE" == "all" ]]; then
  if [[ "$status" -eq 0 ]]; then
    run_suite integration suite_integration || status=1
  else
    echo "== skip: integration (CI suites failed)" >&2
  fi
fi

exit "$status"
