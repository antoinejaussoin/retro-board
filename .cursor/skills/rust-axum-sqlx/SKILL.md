---
name: rust-axum-sqlx
description: Axum, sqlx, Socket.IO, and integration-test patterns for the Retrospected Rust backend. Use when adding routes, queries, sessions, migrations, or API tests under backend/.
---

# Axum, sqlx, and Socket.IO

The backend is a faithful port of the TypeScript service. Match existing HTTP paths, status codes, JSON shapes, Socket.IO event names, and the TypeORM `migrations` table. Do not redesign the API.

## Process model

- One binary listens for HTTP and Socket.IO on `BACKEND_PORT` (default 3201).
- Run migrations to completion before binding the port.
- Share Postgres and Redis through `AppState` held in an `Arc`.
- Log with `tracing`. Do not print secrets, passwords, or session ids.

## HTTP

- Routes live under `/api` plus `GET /healthz`. Keep path strings identical to the TypeScript server.
- Read the session cookie `connect.sid`. The signing secret is `{SESSION_SECRET}-4.11.5`. Signature is HMAC-SHA256 over the session id, base64 without trailing `=`, matching the `cookie-signature` package (`s:{id}.{sig}`).
- Persist sessions in Redis at `sess:{id}` when `REDIS_ENABLED` is true. JSON must include `passport.user` as `{userId}:{identityId}` so a database written by the Node server still authenticates.
- Return JSON errors in the same shape the Node handlers used (status plus body). Do not invent a new error envelope.
- Stripe webhooks need the raw body bytes for signature verification. Do not parse that route as JSON first.
- Trust `X-Forwarded-For` only when the TCP peer is loopback, a private address, or listed in `TRUSTED_PROXIES`. A public peer uses its own address.

## SQL

- Schema comes from the TypeORM migrations. Use `sqlx::query` / `sqlx::query_as` with runtime SQL, not `query!`, because the database is created at test and boot time.
- Map rows with explicit structs. Name SQL columns with `AS` when they differ from Rust field names.
- Open a transaction for any use case that writes more than one row and must succeed or fail together (register, delete account, vote).
- Parameterize every value. Never format user input into SQL.
- Migration SQL is an exception: it is the historical TypeORM text and must be executed unchanged, including multi-statement strings, via the Postgres simple query protocol.

## Migrations

- Record each applied migration in `"migrations"` with the TypeORM `name` and the timestamp taken from the last 13 digits of that name.
- Skip a migration when its name is already present. A database migrated by Node must gain zero new rows.
- `Initial` returns without DDL when `sessions` already exists, and is still recorded.
- Do not add a new migration history table.

## Socket.IO

- Serve Socket.IO v4 on `/socket.io/` with `socketioxide`.
- Event names are the `retrospected/...` strings from the TypeScript `actions` module. Do not rename them.
- The handshake carries the same session cookie as HTTP. Set the socket's identity from `passport.user`.
- Broadcast board events to room `board-{sessionId}`.
- Reply with the existing ack event after each client message.
- Leave `MOVE_POST` without a handler, matching the current server.

## Tests

- Black-box tests in `backend/crates/server/tests` spawn the server binary against real Postgres 16 and Redis.
- Read email verification codes from the database.
- Migration tests compare a normalized `pg_dump --schema-only` and the set of `(timestamp, name)` rows against the TypeORM output.
- Tests must pass against the Rust server. Failures are fixed in Rust, not by changing the frontend or the user-facing compose files.
