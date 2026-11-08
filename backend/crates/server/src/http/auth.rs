use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{ConnectInfo, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use serde_json::{json, Value};
use tokio::sync::Mutex;

use super::{empty, limited, text, with_cookie};
use crate::crypto::{hash_password, verify_password};
use crate::db::{self, Registration};
use crate::email;
use crate::models::user_ids;
use crate::models::{
    ChangeNamePayload, LanguagePayload, LoginPayload, RegisterPayload, ResetPasswordPayload,
    ResetPayload, ValidatePayload,
};
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<LoginPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let username = body.username;
    let result = if username.starts_with("ANONUSER__") && username.ends_with("__ANONUSER") {
        if state.config.disable_anonymous_login {
            return empty(StatusCode::FORBIDDEN);
        }
        let actual = username
            .trim_start_matches("ANONUSER__")
            .trim_end_matches("__ANONUSER");
        let Ok(hash) = hash_password(&body.password) else {
            return empty(StatusCode::FORBIDDEN);
        };
        db::register_anonymous(&state.db, actual, &hash)
            .await
            .ok()
            .flatten()
    } else {
        if state.config.disable_password_login {
            return empty(StatusCode::FORBIDDEN);
        }
        match db::identity_by_username(&state.db, "password", &username).await {
            Ok(Some(identity))
                if identity
                    .password
                    .as_deref()
                    .is_some_and(|hash| verify_password(&body.password, hash).unwrap_or(false)) =>
            {
                if state.config.emails_enabled() && identity.email_verification.is_some() {
                    return empty(StatusCode::FORBIDDEN);
                }
                Some(identity)
            }
            _ => None,
        }
    };
    let Some(identity) = result else {
        return empty(StatusCode::FORBIDDEN);
    };
    if username.starts_with("ANONUSER__") {
        let Some(hash) = identity.password.as_deref() else {
            return empty(StatusCode::FORBIDDEN);
        };
        if !verify_password(&body.password, hash).unwrap_or(false) {
            return empty(StatusCode::FORBIDDEN);
        }
    }
    let mut session = session.lock().await;
    session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
    state.sessions.rotate(&mut session).await;
    with_cookie(&state, &session.id, empty(StatusCode::OK))
}

pub(super) async fn register(
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
    let current = session.lock().await.clone();
    if let Some((user_id, identity_id)) = current.user_ids() {
        if let Ok(Some(user)) =
            db::user_by_identity(&state.db, &identity_id, state.force_pro()).await
        {
            if user.account_type != "anonymous" {
                return text(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "You are already logged in",
                );
            }
            let _ = user_id;
        }
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
        || db::user_owns_email(&state.db, &body.username)
            .await
            .unwrap_or(false)
    {
        return text(StatusCode::FORBIDDEN, "User already exists");
    }
    let Ok(hash) = hash_password(&body.password) else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let code = if state.config.emails_enabled() {
        Some(uuid::Uuid::new_v4().to_string())
    } else {
        None
    };
    let identity = match db::register_user(
        &state.db,
        Registration {
            account_type: "password".into(),
            name: body.name.clone(),
            username: body.username.clone(),
            email: body.username.clone(),
            password: Some(hash),
            email_verified: false,
            email_verification: code.clone(),
            language: body.language.clone(),
            photo: None,
            slack_user_id: None,
            slack_team_id: None,
        },
    )
    .await
    {
        Ok(identity) => identity,
        Err(db::RegisterError::EmailTaken) => {
            return text(StatusCode::FORBIDDEN, "User already exists");
        }
        Err(error) => {
            tracing::warn!(%error, "register failed");
            return empty(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    if let Some((_, anon_identity)) = current.user_ids() {
        let _ = db::merge_users(&state.db, &identity.id, &[anon_identity], state.force_pro()).await;
    }
    let Some(user) = db::user_by_identity(&state.db, &identity.id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    if let Some(code) = code {
        email::send_verification(&state.config, &body.username, &body.name, &code).await;
        return with_cookie(
            &state,
            &current.id,
            Json(json!({ "loggedIn": false, "user": user })).into_response(),
        );
    }
    let mut session = session.lock().await;
    session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
    state.sessions.rotate(&mut session).await;
    with_cookie(
        &state,
        &session.id,
        Json(json!({ "loggedIn": true, "user": user })).into_response(),
    )
}

pub(super) async fn me(
    State(state): State<AppState>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let session = session.lock().await;
    let Some((_, identity_id)) = session.user_ids() else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    let Some(mut user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::UNAUTHORIZED, "Not logged in");
    };
    if state.force_pro() {
        user.pro = true;
    }
    if let Some(raw) = headers.get("cookie").and_then(|value| value.to_str().ok()) {
        if let Some(tracking) = raw
            .split(';')
            .map(str::trim)
            .find_map(|part| part.strip_prefix("retro_aw="))
        {
            if let Ok(value) = serde_json::from_str::<Value>(tracking) {
                let campaign = value.get("campaignId").and_then(Value::as_str);
                let creative = value.get("creativeId").and_then(Value::as_str);
                if let (Some(campaign), Some(creative)) = (campaign, creative) {
                    let _ = db::track_user(
                        &state.db,
                        &user.id,
                        campaign,
                        creative,
                        value.get("device").and_then(Value::as_str),
                        value.get("keyword").and_then(Value::as_str),
                        value.get("gclid").and_then(Value::as_str),
                    )
                    .await;
                }
            }
        }
    }
    Json(user).into_response()
}

pub(super) async fn logout(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let session = session.lock().await;
    state.sessions.destroy(&session.id).await;
    let mut response = Json(json!({ "authenticated": false })).into_response();
    if let Ok(value) = state.sessions.clear_cookie_header().parse() {
        response.headers_mut().insert(header::SET_COOKIE, value);
    }
    response
}

pub(super) async fn rename_user(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<ChangeNamePayload>,
) -> Response {
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return text(StatusCode::UNAUTHORIZED, "Please login");
    };
    let Some(user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::UNAUTHORIZED, "Please login");
    };
    if db::update_user_name(&state.db, &user.id, &body.name)
        .await
        .unwrap_or(false)
    {
        if let Some(updated) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
            .await
            .ok()
            .flatten()
        {
            return Json(updated).into_response();
        }
    }
    text(
        StatusCode::INTERNAL_SERVER_ERROR,
        "Something went wrong while updating the user name",
    )
}

pub(super) async fn language(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<LanguagePayload>,
) -> Response {
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    let Some(user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    let _ = db::update_language(&state.db, &user.id, &body.language).await;
    match db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    {
        Some(user) => Json(user).into_response(),
        None => empty(StatusCode::UNAUTHORIZED),
    }
}

pub(super) async fn validate(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<ValidatePayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some(identity) = db::identity_by_username(&state.db, "password", &body.email)
        .await
        .ok()
        .flatten()
    else {
        return if state.config.self_hosted {
            text(StatusCode::NOT_FOUND, "Email not found")
        } else {
            text(StatusCode::FORBIDDEN, "Code not valid")
        };
    };
    if identity.email_verification.as_deref() == Some(body.code.as_str()) {
        let _ = db::set_verification(&state.db, &identity.id, None).await;
        let mut session = session.lock().await;
        session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
        state.sessions.rotate(&mut session).await;
        let Some(user) = db::user_by_identity(&state.db, &identity.id, state.force_pro())
            .await
            .ok()
            .flatten()
        else {
            return text(StatusCode::INTERNAL_SERVER_ERROR, "Unspecified error");
        };
        return with_cookie(&state, &session.id, Json(user).into_response());
    }
    text(StatusCode::FORBIDDEN, "Code not valid")
}

pub(super) async fn reset(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(body): Json<ResetPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some(identity) = db::identity_by_username(&state.db, "password", &body.email)
        .await
        .ok()
        .flatten()
    else {
        return if state.config.self_hosted {
            text(StatusCode::NOT_FOUND, "Email not found")
        } else {
            empty(StatusCode::OK)
        };
    };
    let code = uuid::Uuid::new_v4().to_string();
    let _ = db::set_verification(&state.db, &identity.id, Some(&code)).await;
    email::send_reset(&state.config, &body.email, &identity.user_name, &code).await;
    empty(StatusCode::OK)
}

pub(super) async fn reset_password(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<ResetPasswordPayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    let Some(identity) = db::identity_by_username(&state.db, "password", &body.email)
        .await
        .ok()
        .flatten()
    else {
        return if state.config.self_hosted {
            text(StatusCode::NOT_FOUND, "Email not found")
        } else {
            text(StatusCode::FORBIDDEN, "Code not valid")
        };
    };
    if identity.email_verification.as_deref() != Some(body.code.as_str()) {
        return text(StatusCode::FORBIDDEN, "Code not valid");
    }
    let Ok(hash) = hash_password(&body.password) else {
        return text(StatusCode::INTERNAL_SERVER_ERROR, "Unspecified error");
    };
    let _ = db::set_password(&state.db, &identity.id, &hash).await;
    let mut session = session.lock().await;
    session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
    state.sessions.rotate(&mut session).await;
    let Some(user) = db::user_by_identity(&state.db, &identity.id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::INTERNAL_SERVER_ERROR, "Unspecified error");
    };
    with_cookie(&state, &session.id, Json(user).into_response())
}
