use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{ConnectInfo, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use tokio::sync::Mutex;

use super::{limited, text};
use crate::db::{self};
use crate::models::DeleteAccountPayload;
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn delete_me(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<DeleteAccountPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    let Some(user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    match db::delete_account(
        &state.db,
        &user,
        body.delete_sessions,
        body.delete_posts,
        body.delete_votes,
    )
    .await
    {
        Ok(result) => Json(result).into_response(),
        Err(error) => {
            tracing::warn!(%error, "delete account");
            Json(false).into_response()
        }
    }
}
