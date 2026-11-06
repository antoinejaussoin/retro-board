FROM rust:1.99.1-bookworm AS build

WORKDIR /usr/src/backend
COPY . .
RUN cargo build --release --locked -p retrospected-server

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/src/backend/target/release/retrospected-server /usr/local/bin/retrospected-server

ENV BACKEND_PORT=3201
EXPOSE 3201

# Migrations run inside the binary before it listens, matching the previous
# `yarn backend-production` entrypoint.
CMD ["retrospected-server"]
