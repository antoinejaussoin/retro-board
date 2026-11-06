---
name: rust-quality
description: Rust quality bar for this repository. Use whenever writing, reviewing, or refactoring Rust code, including crates under backend/, error types, modules, Clippy, and tests.
---

# Rust quality

Follow the Rust API Guidelines (https://rust-lang.github.io/api-guidelines/) and the rules below. The toolchain is pinned in `backend/rust-toolchain.toml`.

## Layout

- A Cargo workspace lives in `backend/`. Crates are small and named for what they own: `migrations`, `domain`, `server`.
- One concept per module. Keep files focused; split when a module mixes I/O, SQL, and HTTP.
- Library paths return `Result`. Binaries may exit on startup failure with context.
- Do not use `unwrap` or `expect` in library code. `expect` is allowed only for invariants a bug would violate, and the message must say why the invariant holds.
- No hidden process-global state. Pass an `AppState` (or narrower references) into handlers.

## Errors

- Domain errors use `thiserror` with source chains. HTTP and socket layers map those errors to status codes at the edge.
- Add context with `anyhow` only in binaries and one-shot scripts, not inside library crates.
- Do not discard errors with `let _ =` unless the failure is explicitly best-effort and commented.

## Types and APIs

- Make invalid states unrepresentable: enums over boolean pairs, newtypes for ids when it clarifies call sites.
- Prefer borrowed data (`&str`, `&[T]`) in function arguments. Own data in structs that outlive the call.
- Public items get a short rustdoc comment. Private items get a comment only when the why is not obvious.
- Derive `Debug` on public types. Derive `Clone` only when cloning is cheap or clearly intended.
- Serde renames must match the existing JSON field names. Do not introduce `camelCase`/`snake_case` drift.

## Style and lints

- Format with `cargo fmt`.
- Workspace lints include `clippy::all`, `clippy::pedantic` (allow `module_name_repetitions`, `must_use_candidate`, `missing_errors_doc`, `missing_panics_doc` where they add noise), and `clippy::nursery` as warn.
- `unsafe` is forbidden unless a comment explains the invariant and why safe code cannot express it. This port should not need `unsafe`.
- Keep functions short enough to test. Extract SQL and pure rules from handlers so they can be unit-tested without a socket.

## Tests

- Unit-test pure logic (ranking, cookie signing, password rules, migration name parsing) next to the code.
- Integration tests talk to Postgres and Redis the way production does. Do not mock the database for migration or session tests.
- Assertions name the behavior that failed. Compare sets of migration names, not only counts.

## Dependencies

- Pin versions in `Cargo.toml` (no wildcards). Prefer well-maintained crates already common for the job: `tokio`, `axum`, `sqlx`, `serde`, `thiserror`, `tracing`.
- Do not add a crate for a handful of lines you can write clearly.
