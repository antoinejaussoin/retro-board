#!/usr/bin/env bash

set -euo pipefail

BACKUP_DIR="/Users/antoine/data/retrospected"
POSTGRES_CONTAINER_NAME="retro-board-dev-postgres-1"
# pg_dumpall rewrites the postgres role password. Put the local dev password back
# afterwards so backend/.env and retro-board-dev/docker-compose.yml keep working.
LOCAL_POSTGRES_PASSWORD="postgres"
KEEP_TMP=0
DRY_RUN=0
TMP_DIR=""

usage() {
  cat <<'EOF'
Usage: scripts/refresh.sh [options]

Restore the latest production backup into the local Postgres container.
Backups are tar.gz archives that contain database.sql.gz (a pg_dumpall script).

Options:
  --backup-dir PATH        Directory containing production backup .tar.gz files.
  --container-name NAME    Docker container name for the running Postgres instance.
  --dry-run                Print the resolved paths and restore command without importing data.
  --keep-tmp               Keep the extracted temporary directory after the script exits.
  -h, --help               Show this help message.
EOF
}

log() {
  printf '[refresh-db] %s\n' "$*"
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
}

cleanup() {
  if [[ "$KEEP_TMP" -eq 1 || -z "$TMP_DIR" || ! -d "$TMP_DIR" ]]; then
    return
  fi

  rm -rf "$TMP_DIR"
}

get_file_timestamp() {
  local file_path="$1"
  local created_at
  local modified_at

  if stat -f '%B' "$file_path" >/dev/null 2>&1; then
    created_at="$(stat -f '%B' "$file_path")"
    modified_at="$(stat -f '%m' "$file_path")"
  else
    created_at="$(stat -c '%W' "$file_path")"
    modified_at="$(stat -c '%Y' "$file_path")"
  fi

  # Some filesystems do not expose a creation timestamp. Fall back to mtime then.
  if [[ ! "$created_at" =~ ^[0-9]+$ ]] || (( created_at <= 0 )); then
    printf '%s\n' "$modified_at"
    return
  fi

  printf '%s\n' "$created_at"
}

find_latest_backup() {
  local latest_backup=""
  local latest_timestamp=0
  local candidate
  local candidate_timestamp

  while IFS= read -r -d '' candidate; do
    candidate_timestamp="$(get_file_timestamp "$candidate")"

    if (( candidate_timestamp > latest_timestamp )); then
      latest_timestamp="$candidate_timestamp"
      latest_backup="$candidate"
    fi
  done < <(find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.tar.gz' -print0)

  if [[ -z "$latest_backup" ]]; then
    printf 'No backup .tar.gz files found in %s\n' "$BACKUP_DIR" >&2
    exit 1
  fi

  printf '%s\n' "$latest_backup"
}

find_database_archive() {
  local search_root="$1"
  local database_archive

  database_archive="$(find "$search_root" -type f -name 'database.sql.gz' -print -quit)"

  if [[ -z "$database_archive" ]]; then
    database_archive="$(find "$search_root" -type f -name 'database.sql.zip' -print -quit)"
  fi

  if [[ -z "$database_archive" ]]; then
    printf 'Unable to find database.sql.gz or database.sql.zip under %s\n' "$search_root" >&2
    exit 1
  fi

  printf '%s\n' "$database_archive"
}

find_database_sql() {
  local search_root="$1"
  local database_sql

  database_sql="$(find "$search_root" -type f -name 'database.sql' -print -quit)"

  if [[ -z "$database_sql" ]]; then
    printf 'Unable to find database.sql under %s\n' "$search_root" >&2
    exit 1
  fi

  printf '%s\n' "$database_sql"
}

extract_database_archive() {
  local archive_path="$1"
  local archive_dir

  archive_dir="$(dirname "$archive_path")"

  if unzip -tqq "$archive_path" >/dev/null 2>&1; then
    unzip -o -q "$archive_path" -d "$archive_dir"
    return
  fi

  if gzip -t "$archive_path" >/dev/null 2>&1; then
    gzip -dc "$archive_path" > "$archive_dir/database.sql"
    return
  fi

  printf 'Unsupported database archive format: %s\n' "$archive_path" >&2
  exit 1
}

find_postgres_container_id() {
  local container_id

  container_id="$(docker ps --filter "name=^/${POSTGRES_CONTAINER_NAME}$" --format '{{.ID}}' | head -n 1)"

  if [[ -z "$container_id" ]]; then
    printf 'Unable to find a running Docker container named %s\n' "$POSTGRES_CONTAINER_NAME" >&2
    exit 1
  fi

  printf '%s\n' "$container_id"
}

list_dump_databases() {
  local database_sql="$1"
  local line
  local name

  # pg_dumpall emits one CREATE DATABASE statement per restored database.
  # postgres, template0, and template1 stay in place: the restore session
  # connects to postgres, and new databases are cloned from template0.
  while IFS= read -r line; do
    name="${line#CREATE DATABASE }"
    name="${name%% WITH *}"
    name="${name%;}"

    if [[ "$name" == \"*\" ]]; then
      name="${name#\"}"
      name="${name%\"}"
      name="${name//\"\"/\"}"
    fi

    case "$name" in
      postgres|template0|template1) continue ;;
    esac

    printf '%s\n' "$name"
  done < <(grep -E '^CREATE DATABASE ' "$database_sql" || true)
}

# psql only substitutes :'var' / :"var" in stdin or files, not in -c strings.
psql_in_container() {
  local container_id="$1"
  local database_name="$2"
  local sql="$3"
  shift 3

  printf '%s\n' "$sql" | docker exec -i "$container_id" psql -U postgres -d postgres \
    -v ON_ERROR_STOP=1 -v dbname="$database_name" "$@"
}

drop_database() {
  local container_id="$1"
  local database_name="$2"
  local exists
  local attempt

  exists="$(
    psql_in_container "$container_id" "$database_name" \
      "SELECT 1 FROM pg_database WHERE datname = :'dbname';" -Atq
  )"

  if [[ "$exists" != "1" ]]; then
    log "Database ${database_name} does not exist; skipping drop"
    return
  fi

  log "Terminating connections to database ${database_name}"
  log "Dropping database ${database_name}"

  psql_in_container "$container_id" "$database_name" \
    "ALTER DATABASE :\"dbname\" WITH ALLOW_CONNECTIONS false;
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'dbname'
  AND pid <> pg_backend_pid();"

  for (( attempt = 1; attempt <= 20; attempt++ )); do
    if psql_in_container "$container_id" "$database_name" 'DROP DATABASE :"dbname";'; then
      return
    fi

    psql_in_container "$container_id" "$database_name" \
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = :'dbname' AND pid <> pg_backend_pid();" \
      >/dev/null
    sleep 0.25
  done

  psql_in_container "$container_id" "$database_name" \
    'ALTER DATABASE :"dbname" WITH ALLOW_CONNECTIONS true;' || true
  printf 'Failed to drop database %s\n' "$database_name" >&2
  exit 1
}

drop_restored_databases() {
  local database_sql="$1"
  local container_id="$2"
  local database_name
  local found=0

  while IFS= read -r database_name; do
    [[ -z "$database_name" ]] && continue
    found=1

    if [[ "$DRY_RUN" -eq 1 ]]; then
      log "Would terminate connections to database ${database_name}"
      log "Would drop database ${database_name}"
      continue
    fi

    drop_database "$container_id" "$database_name"
  done < <(list_dump_databases "$database_sql")

  if [[ "$found" -eq 0 ]]; then
    printf 'No databases to restore found in %s\n' "$database_sql" >&2
    exit 1
  fi
}

run_restore() {
  local database_sql="$1"
  local container_id="$2"
  local database_dir
  local database_file

  database_dir="$(dirname "$database_sql")"
  database_file="$(basename "$database_sql")"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "Dry run only."
    log "Resolved database.sql: $database_sql"
    log "Resolved container id: $container_id"
    log "Command: (cd $database_dir && cat $database_file | docker exec -i $container_id psql -U postgres)"
    log "Would reset role postgres password to the local dev password"
    return
  fi

  log "Importing $database_sql into container $container_id"
  (
    cd "$database_dir"
    cat "$database_file" | docker exec -i "$container_id" psql -U postgres
  )
}

reset_local_password() {
  local container_id="$1"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    return
  fi

  log "Resetting role postgres password to the local dev password"
  docker exec -i "$container_id" psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    -c "ALTER ROLE postgres WITH PASSWORD '${LOCAL_POSTGRES_PASSWORD}';"
}

main() {
  local latest_backup
  local database_archive
  local database_sql
  local container_id

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --backup-dir)
        BACKUP_DIR="$2"
        shift 2
        ;;
      --container-name)
        POSTGRES_CONTAINER_NAME="$2"
        shift 2
        ;;
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --keep-tmp)
        KEEP_TMP=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        printf 'Unknown option: %s\n\n' "$1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  require_command docker
  require_command find
  require_command gzip
  require_command mktemp
  require_command tar
  require_command unzip

  if [[ ! -d "$BACKUP_DIR" ]]; then
    printf 'Backup directory does not exist: %s\n' "$BACKUP_DIR" >&2
    exit 1
  fi

  trap cleanup EXIT INT TERM

  latest_backup="$(find_latest_backup)"
  log "Latest backup: $latest_backup"

  TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/retro-board-prod-refresh.XXXXXX")"
  log "Temporary directory: $TMP_DIR"

  tar -xzf "$latest_backup" -C "$TMP_DIR"

  database_archive="$(find_database_archive "$TMP_DIR")"
  log "Found database archive: $database_archive"

  extract_database_archive "$database_archive"

  database_sql="$(find_database_sql "$TMP_DIR")"
  log "Found database.sql: $database_sql"

  container_id="$(find_postgres_container_id)"
  log "Resolved Postgres container: $container_id"

  drop_restored_databases "$database_sql" "$container_id"
  run_restore "$database_sql" "$container_id"
  reset_local_password "$container_id"

  log "Restore finished"
}

main "$@"
