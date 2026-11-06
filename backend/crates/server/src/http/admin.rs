use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{ConnectInfo, Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use serde_json::json;
use tokio::sync::Mutex;

use super::{empty, limited, text};
use crate::crypto::hash_password;
use crate::db::{self, Registration};
use crate::models::{
    AdminPasswordPayload, BackendCapabilities, DeleteAccountPayload, MergePayload, OAuthFlags,
    RegisterPayload,
};
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn capabilities(State(state): State<AppState>) -> Json<BackendCapabilities> {
    let licenced = state.licence.lock().await.is_some();
    Json(BackendCapabilities {
        self_hosted: state.config.self_hosted,
        email_available: state.config.emails_enabled(),
        admin_email: state.config.self_hosted_admin.clone(),
        licenced,
        slack_client_id: (state.config.slack_bot_enable && !state.config.slack_key.is_empty())
            .then(|| state.config.slack_key.clone()),
        disable_anonymous: state.config.disable_anonymous_login,
        disable_passwords: state.config.disable_password_login,
        disable_password_registration: state.config.disable_password_registration,
        disable_account_deletion: state.config.disable_account_deletion,
        disable_show_author: state.config.disable_show_author,
        ai: !state.config.anthropic_api_key.is_empty(),
        o_auth: OAuthFlags {
            google: !state.config.google_key.is_empty() && !state.config.google_secret.is_empty(),
            github: !state.config.github_key.is_empty() && !state.config.github_secret.is_empty(),
            microsoft: !state.config.microsoft_key.is_empty()
                && !state.config.microsoft_secret.is_empty(),
            slack: !state.config.slack_key.is_empty() && !state.config.slack_secret.is_empty(),
            twitter: !state.config.twitter_key.is_empty()
                && !state.config.twitter_secret.is_empty(),
            okta: !state.config.okta_audience.is_empty()
                && !state.config.okta_key.is_empty()
                && !state.config.okta_secret.is_empty(),
        },
    })
}

pub(super) async fn require_admin(state: &AppState, session: &Session) -> bool {
    let Some((_, identity_id)) = session.user_ids() else {
        return false;
    };
    db::identity(&state.db, &identity_id)
        .await
        .ok()
        .flatten()
        .and_then(|identity| identity.user_email)
        .as_deref()
        == Some(state.config.self_hosted_admin.as_str())
}

pub(super) async fn admin_users(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(StatusCode::FORBIDDEN, "You are not allowed to do this");
    }
    match db::users_except_deleted(&state.db, state.force_pro()).await {
        Ok(users) => Json(users).into_response(),
        Err(_) => empty(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub(super) async fn admin_password(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<AdminPasswordPayload>,
) -> Response {
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(StatusCode::FORBIDDEN, "You are not allowed to do this");
    }
    let Some(identity) = db::password_identity_for_user(&state.db, &body.user_id)
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::FORBIDDEN, "Cannot update users password");
    };
    let Ok(hash) = hash_password(&body.password) else {
        return text(StatusCode::FORBIDDEN, "Cannot update users password");
    };
    let _ = db::set_password(&state.db, &identity.id, &hash).await;
    match db::user_by_identity(&state.db, &identity.id, state.force_pro())
        .await
        .ok()
        .flatten()
    {
        Some(user) => Json(user).into_response(),
        None => text(StatusCode::FORBIDDEN, "Cannot update users password"),
    }
}

pub(super) async fn admin_merge(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<MergePayload>,
) -> Response {
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(StatusCode::FORBIDDEN, "You are not allowed to do this");
    }
    match db::merge_users(&state.db, &body.main, &body.merged, state.force_pro()).await {
        Ok(true) => empty(StatusCode::OK),
        _ => text(
            StatusCode::FORBIDDEN,
            "Cannot merge users. Something went wrong",
        ),
    }
}

pub(super) async fn admin_stats(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(StatusCode::FORBIDDEN, "You are not allowed to do this");
    }
    let clients = state
        .io
        .get()
        .map(|io| io.local_client_count())
        .unwrap_or(0);
    Json(json!({ "clients": clients })).into_response()
}

pub(super) async fn admin_create_user(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<RegisterPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(
            StatusCode::FORBIDDEN,
            "Adding a user is only allowed for the self-hosted admin.",
        );
    }
    if state.config.disable_password_registration {
        return text(
            StatusCode::FORBIDDEN,
            "Password accounts registration is disabled.",
        );
    }
    if db::identity_by_username(&state.db, "password", &body.username)
        .await
        .ok()
        .flatten()
        .is_some()
    {
        return text(StatusCode::FORBIDDEN, "User already exists");
    }
    let Ok(hash) = hash_password(&body.password) else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let identity = match db::register_user(
        &state.db,
        Registration {
            account_type: "password".into(),
            name: body.name,
            username: body.username.clone(),
            email: body.username,
            password: Some(hash),
            email_verification: None,
            language: body.language,
            photo: None,
            slack_user_id: None,
            slack_team_id: None,
        },
    )
    .await
    {
        Ok(identity) => identity,
        Err(_) => return empty(StatusCode::INTERNAL_SERVER_ERROR),
    };
    match db::user_by_identity(&state.db, &identity.id, state.force_pro())
        .await
        .ok()
        .flatten()
    {
        Some(user) => Json(json!({ "loggedIn": false, "user": user })).into_response(),
        None => empty(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub(super) async fn admin_delete_user(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Path(identity_id): Path<String>,
    body: Option<Json<DeleteAccountPayload>>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let guard = session.lock().await;
    if !require_admin(&state, &guard).await {
        return text(
            StatusCode::FORBIDDEN,
            "Deleting a user is only allowed for the self-hosted admin.",
        );
    }
    let Some(user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::NOT_FOUND, "User not found");
    };
    let payload = body.map(|Json(body)| body).unwrap_or(DeleteAccountPayload {
        delete_sessions: false,
        delete_posts: false,
        delete_votes: false,
    });
    match db::delete_account(
        &state.db,
        &user,
        payload.delete_sessions,
        payload.delete_posts,
        payload.delete_votes,
    )
    .await
    {
        Ok(result) => Json(result).into_response(),
        Err(_) => Json(false).into_response(),
    }
}
