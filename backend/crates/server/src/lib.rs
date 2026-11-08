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
mod log;
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

pub use config::{load_dotenv, Config};
pub use models::export_typescript;

use crate::state::{limiters, AppState};

/// Bind HTTP and Socket.IO after migrations have finished.
///
/// # Errors
/// Returns an error when the database, Redis, or the listener cannot start.
pub async fn run(config: Config) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(message) = config.hosted_startup_error() {
        return Err(message.into());
    }
    for warning in config.startup_warnings() {
        tracing::warn!("{warning}");
    }
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url())
        .await?;
    let applied = retrospected_migrations::run(&pool).await?;
    let sessions = crate::session::SessionStore::connect(&config).await?;
    let licence = licence::resolve(&config).await;
    log::banner(
        &config,
        licence.as_ref().map(|licence| licence.owner.as_str()),
        applied,
    );
    if config.self_hosted
        && (config.self_hosted_admin.is_empty() || config.self_hosted_admin == "admin@acme.com")
    {
        tracing::warn!(
            admin = %config.self_hosted_admin,
            "SELF_HOSTED_ADMIN is still the default; set it to the operator's email"
        );
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
    if let Err(error) = seed_admin(&state).await {
        tracing::warn!(%error, "could not seed the self-hosted admin");
    }
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

async fn seed_admin(state: &AppState) -> Result<(), Box<dyn std::error::Error>> {
    if !state.config.self_hosted || state.config.self_hosted_admin_password.is_empty() {
        return Ok(());
    }
    let email = state.config.self_hosted_admin.as_str();
    if db::user_owns_email(&state.db, email).await? {
        return Ok(());
    }
    let hash = crate::crypto::hash_password(&state.config.self_hosted_admin_password)?;
    db::register_user(
        &state.db,
        db::Registration {
            account_type: "password".into(),
            name: email.to_owned(),
            username: email.to_owned(),
            email: email.to_owned(),
            email_verified: false,
            password: Some(hash),
            email_verification: None,
            language: None,
            photo: None,
            slack_user_id: None,
            slack_team_id: None,
        },
    )
    .await?;
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
    let listener = tokio::net::TcpListener::bind(address).await?;
    log::listening(port);
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
    let method = request.method().to_string();
    let path = request.uri().path().to_owned();
    let headers = request.headers().clone();
    let session = http::attach_session(&state, &headers).await;
    request.extensions_mut().insert(session.clone());
    let response = next.run(request).await;
    log::http(&method, &path, response.status().as_u16());
    let id = session.lock().await.id.clone();
    http::with_cookie(&state, &id, response)
}
