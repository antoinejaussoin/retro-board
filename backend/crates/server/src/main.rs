//! Retrospected backend. Migrations run before the port is opened.
#![allow(
    dead_code,
    clippy::field_reassign_with_default,
    clippy::wrong_self_convention,
    clippy::type_complexity,
    clippy::let_underscore_future
)]

mod ai;
mod config;
mod crypto;
mod db;
mod demo;
mod domains;
mod email;
mod http;
mod licence;
mod models;
mod oauth;
mod session;
mod state;
mod stripe;
mod ws;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{Request, State};
use axum::middleware::{self, Next};
use axum::response::Response;
use socketioxide::adapter::Adapter;
use socketioxide::SocketIo;
use socketioxide_core::adapter::DefinedAdapter;
use socketioxide_redis::{RedisAdapter, RedisAdapterCtr};
use sqlx::postgres::PgPoolOptions;
use std::sync::OnceLock;
use tokio::sync::Mutex;

use crate::config::Config;
use crate::state::{limiters, AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();
    let config = Config::from_env();
    if let Err(error) = run(config).await {
        tracing::error!(%error, "backend stopped");
        std::process::exit(1);
    }
}

async fn run(config: Config) -> Result<(), Box<dyn std::error::Error>> {
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url())
        .await?;
    let applied = retrospected_migrations::run(&pool).await?;
    tracing::info!(applied, "migrations complete");
    let sessions = crate::session::SessionStore::connect(&config).await?;
    let licence = licence::resolve(&config).await;
    if let Some(licence) = &licence {
        tracing::info!(owner = %licence.owner, "this software is licenced");
    } else {
        tracing::warn!("this software is not licenced");
    }
    let (http_limit, ws_limit) = limiters(&config);
    let io_slot = Arc::new(OnceLock::new());
    let state = AppState {
        db: pool,
        config: config.clone(),
        sessions,
        licence: Arc::new(Mutex::new(licence)),
        http_limit,
        ws_limit,
        io: io_slot.clone(),
    };
    if config.redis_for_socketio {
        // socketioxide-redis publishes on RESP3 (Redis 7+). Every backend
        // process is Rust, so this does not have to match the old Node adapter.
        // The namespace subscription must finish before the port opens.
        let url = format!("{}?protocol=resp3", config.redis_url());
        let client = redis::Client::open(url)?;
        let adapter = RedisAdapterCtr::new_with_redis(&client).await?;
        let (layer, io) = SocketIo::builder()
            .max_payload(config.ws_max_buffer_size)
            .with_state(state.clone())
            .with_adapter::<RedisAdapter<_>>(adapter)
            .build_layer();
        tracing::info!("socket.io redis adapter enabled");
        let _ = io_slot.set(Arc::new(io.clone()));
        ws::register(&io)
            .await
            .map_err(|error| format!("socket.io redis namespace: {error}"))?;
        serve(state, layer).await?;
    } else {
        let (layer, io) = SocketIo::builder()
            .max_payload(config.ws_max_buffer_size)
            .with_state(state.clone())
            .build_layer();
        let _ = io_slot.set(Arc::new(io.clone()));
        ws::register(&io);
        serve(state, layer).await?;
    }
    Ok(())
}

async fn serve<A>(
    state: AppState,
    layer: socketioxide::layer::SocketIoLayer<A>,
) -> Result<(), Box<dyn std::error::Error>>
where
    A: Adapter + DefinedAdapter,
{
    let port = state.config.backend_port;
    let app = http::router()
        .layer(middleware::from_fn_with_state(
            state.clone(),
            session_middleware,
        ))
        .layer(layer)
        .with_state(state);
    let address = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!(%address, "listening");
    let listener = tokio::net::TcpListener::bind(address).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;
    Ok(())
}

async fn session_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    let headers = request.headers().clone();
    let session = http::attach_session(&state, &headers).await;
    request.extensions_mut().insert(session.clone());
    let response = next.run(request).await;
    let id = session.lock().await.id.clone();
    http::with_cookie(&state, &id, response)
}
