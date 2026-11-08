FROM lukemathwalker/cargo-chef:0.1.78-rust-1.99.1-bookworm AS chef
WORKDIR /usr/src/backend

# Dependencies are compiled before the sources are copied. That layer is reused
# until Cargo.toml or Cargo.lock changes.
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build
# The Sentry client links OpenSSL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*
COPY --from=planner /usr/src/backend/recipe.json recipe.json
RUN cargo chef cook --release --locked --package retrospected-server --recipe-path recipe.json
COPY . .
RUN cargo build --release --locked --package retrospected-server

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/src/backend/target/release/retrospected-server /usr/local/bin/retrospected-server

ENV BACKEND_PORT=3201
EXPOSE 3201

# Migrations run inside the binary before it listens, matching the previous
# production entrypoint.
CMD ["retrospected-server"]
