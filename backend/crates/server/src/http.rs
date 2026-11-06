//! HTTP routes preserved from the TypeScript server.

use std::net::SocketAddr;
use std::sync::Arc;

use axum::body::Bytes;
use axum::extract::{ConnectInfo, Path, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{delete, get, patch, post};
use axum::{Extension, Json, Router};
use serde::Deserialize;
use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::crypto::{hash_password, stripe_signature_valid, verify_password};
use crate::db::{self, Registration};
use crate::email;
use crate::models::user_ids;
use crate::models::{
    AdminPasswordPayload, BackendCapabilities, ChangeNamePayload, CheckoutPayload,
    CreateSessionPayload, DeleteAccountPayload, LanguagePayload, LicencePayload, LoginPayload,
    MergePayload, OAuthFlags, RegisterPayload, ResetPasswordPayload, ResetPayload, ValidatePayload,
};
use crate::session::Session;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/ping", get(|| async { "pong" }))
        .route("/healthz", get(|| async { StatusCode::OK }))
        .route("/api/auth/anonymous/login", post(login))
        .route("/api/auth/login", post(login))
        .nest("/api/auth", crate::oauth::router())
        .route("/api/stripe/webhook", post(stripe_webhook))
        .route("/api/stripe/create-checkout-session", post(checkout))
        .route("/api/stripe/products", get(products))
        .route("/api/stripe/portal", get(portal))
        .route("/api/stripe/members", get(members).patch(patch_members))
        .route("/api/stripe/admins", patch(patch_admins))
        .route("/api/stripe/domain/{domain}", get(domain_ok))
        .route("/api/stripe/start-trial", post(start_trial))
        .route("/api/admin/self-hosting", get(capabilities))
        .route("/api/admin/users", get(admin_users))
        .route("/api/admin/user", patch(admin_password))
        .route("/api/admin/merge", post(admin_merge))
        .route("/api/admin/stats", get(admin_stats))
        .route("/api/slack/create", post(slack_create))
        .route("/api/ai/chat", post(ai_chat))
        .route("/api/create", post(create_session))
        .route("/api/demo", post(create_demo))
        .route("/api/logout", post(logout))
        .route("/api/me", get(me))
        .route("/api/me/username", post(rename_user))
        .route("/api/me", delete(delete_me))
        .route("/api/quota", get(quota))
        .route("/api/previous", get(previous))
        .route("/api/session/{session_id}", delete(delete_session))
        .route("/api/me/language", post(language))
        .route("/api/me/default-template", get(default_template))
        .route("/api/register", post(register))
        .route("/api/user/{identity_id}", delete(admin_delete_user))
        .route("/api/user", post(admin_create_user))
        .route("/api/users", get(related))
        .route("/api/validate", post(validate))
        .route("/api/reset", post(reset))
        .route("/api/reset-password", post(reset_password))
        .route("/api/self-hosted", post(self_hosted_bool))
        .route("/api/self-hosted-licence", post(self_hosted_meta))
}

pub async fn attach_session(state: &AppState, headers: &HeaderMap) -> Arc<Mutex<Session>> {
    let cookie = headers
        .get(header::COOKIE)
        .and_then(|value| value.to_str().ok());
    let session = if let Some(sid) = state.sessions.from_cookie(cookie) {
        state.sessions.load(&sid).await.unwrap_or_else(|| Session {
            id: sid,
            passport_user: None,
            socket_id: None,
            raw: json!({}),
        })
    } else {
        state.sessions.create().await
    };
    Arc::new(Mutex::new(session))
}

pub fn with_cookie(state: &AppState, session_id: &str, response: Response) -> Response {
    let mut response = response;
    if let Ok(value) = state.sessions.set_cookie_header(session_id).parse() {
        response.headers_mut().insert(header::SET_COOKIE, value);
    }
    response
}

fn client_ip(headers: &HeaderMap, addr: Option<SocketAddr>) -> String {
    headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
        .or_else(|| addr.map(|addr| addr.ip().to_string()))
        .unwrap_or_else(|| "unknown".into())
}

async fn limited(state: &AppState, headers: &HeaderMap, addr: Option<SocketAddr>) -> bool {
    state.http_limit.allow(&client_ip(headers, addr)).await
}

async fn login(
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
                Some(identity)
            }
            _ => None,
        }
    };
    let Some(identity) = result else {
        return empty(StatusCode::FORBIDDEN);
    };
    // Re-check password for anonymous accounts that already had a hash.
    if username.starts_with("ANONUSER__") {
        if let Some(hash) = identity.password.as_deref() {
            if !verify_password(&body.password, hash).unwrap_or(false) {
                return empty(StatusCode::FORBIDDEN);
            }
        }
    }
    let mut session = session.lock().await;
    session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
    state.sessions.save(&session).await;
    with_cookie(&state, &session.id, empty(StatusCode::OK))
}

async fn register(
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
    state.sessions.save(&session).await;
    with_cookie(
        &state,
        &session.id,
        Json(json!({ "loggedIn": true, "user": user })).into_response(),
    )
}

async fn me(
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

async fn logout(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let session = session.lock().await;
    state.sessions.destroy(&session.id).await;
    Json(json!({ "authenticated": false })).into_response()
}

async fn rename_user(
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

async fn language(
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

async fn quota(
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

async fn previous(
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

async fn create_session(
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

async fn create_demo(
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

async fn delete_session(
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

async fn delete_me(
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

async fn default_template() -> StatusCode {
    StatusCode::NOT_FOUND
}

async fn related(
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

async fn validate(
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
        return text(StatusCode::NOT_FOUND, "Email not found");
    };
    if identity.email_verification.as_deref() == Some(body.code.as_str()) {
        let _ = db::set_verification(&state.db, &identity.id, None).await;
        let mut session = session.lock().await;
        session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
        state.sessions.save(&session).await;
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

async fn reset(
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
        return text(StatusCode::NOT_FOUND, "Email not found");
    };
    let code = uuid::Uuid::new_v4().to_string();
    let _ = db::set_verification(&state.db, &identity.id, Some(&code)).await;
    email::send_reset(&state.config, &body.email, &identity.user_name, &code).await;
    empty(StatusCode::OK)
}

async fn reset_password(
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
        return text(StatusCode::NOT_FOUND, "Email not found");
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
    state.sessions.save(&session).await;
    let Some(user) = db::user_by_identity(&state.db, &identity.id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(StatusCode::INTERNAL_SERVER_ERROR, "Unspecified error");
    };
    with_cookie(&state, &session.id, Json(user).into_response())
}

async fn capabilities(State(state): State<AppState>) -> Json<BackendCapabilities> {
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
        ai: !state.config.open_ai_api_key.is_empty(),
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

async fn require_admin(state: &AppState, session: &Session) -> bool {
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

async fn admin_users(
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

async fn admin_password(
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

async fn admin_merge(
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

async fn admin_stats(
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

async fn admin_create_user(
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

async fn admin_delete_user(
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

async fn self_hosted_bool(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(body): Json<LicencePayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    match db::licence_by_key(&state.db, &body.key).await {
        Ok(Some(_)) => Json(true).into_response(),
        Ok(None) => Json(false).into_response(),
        Err(_) => text(StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong"),
    }
}

async fn self_hosted_meta(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(body): Json<LicencePayload>,
) -> Response {
    if !limited(&state, &headers, Some(addr)).await {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            "Your request has been rate-limited. Please try again in a few seconds.",
        );
    }
    match db::licence_by_key(&state.db, &body.key).await {
        Ok(Some(email)) => Json(json!({ "licence": body.key, "owner": email })).into_response(),
        Ok(None) => (StatusCode::FORBIDDEN, Json(Value::Null)).into_response(),
        Err(_) => text(StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong"),
    }
}

async fn products() -> Json<Vec<crate::models::Product>> {
    Json(crate::stripe::products())
}

async fn stripe_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> StatusCode {
    if state.config.stripe_secret.is_empty() {
        return StatusCode::INTERNAL_SERVER_ERROR;
    }
    let Some(signature) = headers
        .get("stripe-signature")
        .and_then(|value| value.to_str().ok())
    else {
        return StatusCode::BAD_REQUEST;
    };
    if !stripe_signature_valid(
        &body,
        signature.trim(),
        &state.config.stripe_webhook_secret,
        300,
    ) {
        tracing::warn!("stripe webhook signature verification failed");
        return StatusCode::BAD_REQUEST;
    }
    let Ok(event) = serde_json::from_slice::<Value>(&body) else {
        return StatusCode::BAD_REQUEST;
    };
    let kind = event.get("type").and_then(Value::as_str).unwrap_or("");
    match kind {
        "customer.subscription.deleted" => {
            if let Some(id) = event.pointer("/data/object/id").and_then(Value::as_str) {
                let _ = db::cancel_subscription(&state.db, id).await;
            }
        }
        "checkout.session.completed" => {
            if event
                .pointer("/data/object/payment_status")
                .and_then(Value::as_str)
                == Some("paid")
            {
                let product = event
                    .pointer("/data/object/metadata/plan")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let owner = event
                    .pointer("/data/object/client_reference_id")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let subscription = event
                    .pointer("/data/object/subscription")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let domain = event
                    .pointer("/data/object/metadata/domain")
                    .and_then(Value::as_str);
                let currency = event
                    .pointer("/data/object/metadata/currency")
                    .and_then(Value::as_str)
                    .unwrap_or("usd");
                if product == "self-hosted" {
                    let key = uuid::Uuid::new_v4().to_string();
                    let email = event
                        .pointer("/data/object/customer_details/email")
                        .and_then(|value| value.as_str());
                    if db::register_licence(&state.db, email, &key, owner, subscription)
                        .await
                        .is_ok()
                    {
                        if let Some(email) = email {
                            email::send_welcome(&state.config, email, email, &key).await;
                        }
                    }
                } else if !owner.is_empty() && !subscription.is_empty() {
                    let _ = db::activate_subscription(
                        &state.db,
                        subscription,
                        owner,
                        product,
                        domain,
                        currency,
                    )
                    .await;
                }
            }
        }
        _ => tracing::info!(kind, "stripe event"),
    }
    StatusCode::OK
}

async fn checkout(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<CheckoutPayload>,
) -> Response {
    if state.config.stripe_secret.is_empty() {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    }
    if body
        .domain
        .as_deref()
        .is_some_and(|domain| !crate::domains::is_valid(domain))
    {
        return empty(StatusCode::FORBIDDEN);
    }
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    let Some(identity) = db::identity(&state.db, &identity_id).await.ok().flatten() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    if identity.account_type == "anonymous" {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    }
    let customer = if let Some(id) = identity.stripe_id.clone() {
        id
    } else {
        match crate::stripe::create_customer(&state.config, &identity, &body.locale).await {
            Ok(id) => {
                let _ = db::set_stripe_customer(&state.db, &identity.user_id, &id).await;
                id
            }
            Err(error) => {
                tracing::warn!(%error, "stripe customer");
                return empty(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    };
    match crate::stripe::checkout(&state.config, &customer, &identity.user_id, &body).await {
        Ok(id) => Json(json!({ "id": id })).into_response(),
        Err(error) => {
            tracing::warn!(%error, "stripe checkout");
            empty(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn portal(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    if state.config.stripe_secret.is_empty() {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    }
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let Some(identity) = db::identity(&state.db, &identity_id).await.ok().flatten() else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let Some(customer) = identity.stripe_id else {
        return empty(StatusCode::INTERNAL_SERVER_ERROR);
    };
    match crate::stripe::portal(&state.config, &customer).await {
        Ok(url) => Json(json!({ "url": url })).into_response(),
        Err(_) => empty(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

async fn members(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> Response {
    let Some((user_id, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    let email = db::identity(&state.db, &identity_id)
        .await
        .ok()
        .flatten()
        .and_then(|identity| identity.user_email);
    match db::team_members(&state.db, &user_id, email.as_deref(), false).await {
        Ok(Some(members)) => Json(members).into_response(),
        _ => empty(StatusCode::UNAUTHORIZED),
    }
}

async fn patch_members(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<Vec<String>>,
) -> Response {
    let Some((user_id, identity_id)) = session.lock().await.user_ids() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    let email = db::identity(&state.db, &identity_id)
        .await
        .ok()
        .flatten()
        .and_then(|identity| identity.user_email);
    if db::set_members(&state.db, &user_id, email.as_deref(), &body)
        .await
        .unwrap_or(false)
    {
        empty(StatusCode::OK)
    } else {
        empty(StatusCode::UNAUTHORIZED)
    }
}

async fn patch_admins(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<Vec<String>>,
) -> Response {
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return empty(StatusCode::UNAUTHORIZED);
    };
    if db::set_admins(&state.db, &user_id, &body)
        .await
        .unwrap_or(false)
    {
        empty(StatusCode::OK)
    } else {
        empty(StatusCode::UNAUTHORIZED)
    }
}

async fn domain_ok(Path(domain): Path<String>) -> Json<bool> {
    Json(crate::domains::is_valid(&domain))
}

async fn start_trial(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
) -> StatusCode {
    let Some((user_id, _)) = session.lock().await.user_ids() else {
        return StatusCode::INTERNAL_SERVER_ERROR;
    };
    if db::start_trial(&state.db, &user_id, state.force_pro())
        .await
        .unwrap_or(false)
    {
        StatusCode::OK
    } else {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}

#[derive(Deserialize)]
struct SlackForm {
    user_id: String,
    text: String,
    response_url: String,
}

async fn slack_create(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> StatusCode {
    let parsed = if headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .contains("json")
    {
        serde_json::from_slice::<SlackForm>(&body).ok()
    } else {
        serde_urlencoded::from_bytes::<SlackForm>(&body).ok()
    };
    let Some(form) = parsed else {
        return StatusCode::OK;
    };
    let message = if let Some(user_id) = db::user_id_by_slack(&state.db, &form.user_id)
        .await
        .ok()
        .flatten()
    {
        match db::create_session(&state.db, &user_id, None).await {
            Ok(mut board) => {
                let _ = db::rename_session(&state.db, &board.id, &form.text).await;
                board.name = Some(form.text.clone());
                format!("All done! You can start retrospecting here: {}/game/{}", state.config.base_url, board.id)
            }
            Err(_) => "Unfortunately, we could not identify you on Retrospected. Try logging in with your Slack account at least once on Retrospected, so we can link your Retrospected account with your Slack account.".into(),
        }
    } else {
        "Unfortunately, we could not identify you on Retrospected. Try logging in with your Slack account at least once on Retrospected, so we can link your Retrospected account with your Slack account.".into()
    };
    let _ = reqwest::Client::new()
        .post(&form.response_url)
        .json(&json!({ "response_type": "in_channel", "text": message }))
        .send()
        .await;
    StatusCode::OK
}

async fn ai_chat(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<crate::models::AiChatPayload>,
) -> Response {
    let Some((_, identity_id)) = session.lock().await.user_ids() else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    let Some(user) = db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
    else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    let allowance = db::ai_allowance(
        &state.db,
        &user.id,
        user.pro,
        state.config.open_ai_free_limit,
        state.config.open_ai_paid_limit,
    )
    .await
    .unwrap_or(0.0);
    if allowance > 1.0 {
        return text(
            StatusCode::PAYMENT_REQUIRED,
            "You have reached your monthly allowance of messages",
        );
    }
    if state.config.open_ai_api_key.is_empty() {
        return text(StatusCode::INTERNAL_SERVER_ERROR, "AI is not configured");
    }
    let mut messages = body.messages.clone();
    if !messages.iter().any(|message| message.role == "system") {
        messages.insert(
            0,
            crate::models::CoachMessage {
                role: "system".into(),
                content: Some(crate::ai::SYSTEM.into()),
            },
        );
    }
    let answer = match crate::ai::complete(&state.config.open_ai_api_key, &messages).await {
        Ok(answer) => answer,
        Err(error) => {
            tracing::warn!(%error, "openai");
            return text(StatusCode::INTERNAL_SERVER_ERROR, "AI request failed");
        }
    };
    if let Some(last) = body
        .messages
        .iter()
        .rev()
        .find(|message| message.role == "user")
    {
        if let Some(content) = &last.content {
            let _ = db::record_ai(&state.db, &body.id, &user.id, "user", content).await;
        }
    }
    let _ = db::record_ai(&state.db, &body.id, &user.id, "assistant", &answer).await;
    let mut response = body.messages;
    response.push(crate::models::CoachMessage {
        role: "assistant".into(),
        content: Some(answer),
    });
    Json(response).into_response()
}

fn empty(status: StatusCode) -> Response {
    (status, [(header::CONTENT_TYPE, "application/json")]).into_response()
}

fn text(status: StatusCode, body: &str) -> Response {
    (status, body.to_owned()).into_response()
}
