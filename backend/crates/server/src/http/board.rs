use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{ConnectInfo, Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use serde_json::{json, Value};
use tokio::sync::Mutex;

use super::{empty, limited, text};
use crate::db::{self};
use crate::models::CreateSessionPayload;
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn quota(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    match db::quota(&state.db, &user_id).await {
        Ok((posts, quota)) => Json(json!({ "posts": posts, "quota": quota })).into_response(),
        Err(_) => text(StatusCode::UNAUTHORIZED, "Not logged in"),
    }
}

pub(super) async fn previous(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return Json(Vec::<Value>::new()).into_response();
    };
    match db::previous_sessions(&state.db, &user_id).await {
        Ok(sessions) => Json(sessions).into_response(),
        Err(error) => {
            tracing::warn!(%error, "previous sessions");
            Json(Vec::<Value>::new()).into_response()
        }
    }
}

pub(super) async fn create_session(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<CreateSessionPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You must be logged in in order to create a session",
        );
    };
    match db::create_session(&state.db, &user_id, body.encrypted_check.as_deref()).await {
        Ok(board) => Json(board).into_response(),
        Err(error) => {
            tracing::warn!(%error, "create session");
            empty(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub(super) async fn create_demo(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You must be logged in in order to create a session",
        );
    };
    match crate::demo::create(&state.db, &user_id).await {
        Ok(board) => Json(board).into_response(),
        Err(error) => {
            tracing::warn!(%error, "demo");
            empty(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub(super) async fn delete_session(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Path(session_id): Path<String>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::FORBIDDEN);
    };
    match db::delete_session(&state.db, &identity_id, &session_id, state.force_pro()).await {
        Ok(true) => empty(StatusCode::OK),
        _ => empty(StatusCode::FORBIDDEN),
    }
}

pub(super) async fn default_template() -> StatusCode {
    StatusCode::NOT_FOUND
}

pub(super) async fn related(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    match db::related_users(&state.db, &user_id, state.force_pro()).await {
        Ok(users) => Json(users).into_response(),
        Err(_) => text(StatusCode::UNAUTHORIZED, "Not logged in"),
    }
}
