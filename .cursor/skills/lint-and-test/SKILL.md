---
name: lint-and-test
description: >-
  Runs Retrospected lint, tests, and production builds for the frontend, Rust
  backend, marketing site, and docs, then the Cypress integration suite.
  Investigates failures and fixes them until those commands pass. Use when the
  user invokes /lint-and-test or asks to run lint and tests across the board,
  including integration tests.
disable-model-invocation: true
---

# Lint and test

Run the same checks as `.github/workflows/ci.yml`, then the pull-request integration job in `.github/workflows/e2e.yml`. Fix product failures until the run is green. Do not commit.

Execute [scripts/check.sh](scripts/check.sh). Do not reimplement the commands.

```bash
.cursor/skills/lint-and-test/scripts/check.sh          # CI suites, then integration
.cursor/skills/lint-and-test/scripts/check.sh ci       # frontend, backend, marketing, docs
.cursor/skills/lint-and-test/scripts/check.sh frontend
.cursor/skills/lint-and-test/scripts/check.sh backend
.cursor/skills/lint-and-test/scripts/check.sh marketing
.cursor/skills/lint-and-test/scripts/check.sh docs
.cursor/skills/lint-and-test/scripts/check.sh integration
```

`all` runs every CI suite even after one fails, and starts integration only when those four passed. Backend tests need Postgres 16 on `127.0.0.1:5432` (`postgres` / `postgres`, database `postgres`) and Redis on `127.0.0.1:6379`. The script starts `retro-lint-postgres` and `retro-lint-redis` when those ports are free. `psql` must be on `PATH`. If the port is taken by a server that rejects that login, stop and say so.

The toolchain is `backend/rust-toolchain.toml`. Run Cargo from `backend/` so rustup selects it. CI Node is 26.13.0. Switch only when a failure is specific to the local Node version.

## When a command fails

1. Read the log. Reproduce with the narrowest command that still fails: one Vitest file, one `cargo test -p … --test …` target, or one Cypress spec.
2. Fix the cause in the product. A test changes only when it contradicts the specified behavior (HTTP paths, JSON, Socket.IO events, migration catalogue). Otherwise the code is wrong.
3. Rust edits follow `.cursor/skills/rust-quality/SKILL.md` and `.cursor/skills/rust-axum-sqlx/SKILL.md`. User-facing copy follows `.cursor/skills/translations/SKILL.md`.
4. Do not delete tests, add skips or `#[ignore]`, weaken assertions, allow a new Clippy lint, or edit the workflows to go green. Do not change the script to drop a check. If the script drifts from the workflows, update the script to match the workflows.
5. Re-run the narrow command, then the full suite you touched (`frontend`, `backend`, `marketing`, `docs`, or `integration`). Integration images are `retro-backend:local` and `retro-frontend:local`. A source fix is not covered until those images are rebuilt and `check.sh integration` passes. Cypress videos and screenshots are under `integration/cypress/`.
6. If two attempts leave the same error, stop and report it. A blocked run (port in use, missing `psql`, registry down) is not a pass.

## Report

- Each suite: pass or fail
- What changed, and why, when you edited the tree
- Anything still red, with the command that fails
