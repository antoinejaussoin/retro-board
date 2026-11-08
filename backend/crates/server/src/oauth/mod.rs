//! OAuth start and callback routes. Callback URLs stay `${BASE_URL}/api/auth/{provider}/callback`.

use std::sync::Arc;

use axum::extract::{Query, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Redirect, Response};
use axum::routing::get;
use axum::Extension;
use axum::Router;
use serde::Deserialize;
use serde_json::Value;
use tokio::sync::Mutex;

use crate::db::{self, Registration};
use crate::models::user_ids;
use crate::session::Session;
use crate::state::AppState;

mod twitter;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/twitter", get(twitter::start_twitter))
        .route("/twitter/callback", get(twitter::callback_twitter))
        .route("/google", get(start_oauth))
        .route("/google/callback", get(callback_oauth))
        .route("/github", get(start_oauth))
        .route("/github/callback", get(callback_oauth))
        .route("/slack", get(start_oauth))
        .route("/slack/callback", get(callback_oauth))
        .route("/microsoft", get(start_oauth))
        .route("/microsoft/callback", get(callback_oauth))
        .route("/okta", get(start_oauth))
        .route("/okta/callback", get(callback_oauth))
        .route("/facebook", get(facebook_disabled))
}

async fn facebook_disabled() -> StatusCode {
    StatusCode::NOT_FOUND
}

#[derive(Deserialize)]
pub(super) struct CallbackQuery {
    code: Option<String>,
    state: Option<String>,
    oauth_token: Option<String>,
    oauth_verifier: Option<String>,
}

async fn start_oauth(
    State(state): State<AppState>,
    Extension(slot): Extension<Arc<Mutex<Session>>>,
    axum::extract::OriginalUri(uri): axum::extract::OriginalUri,
) -> Response {
    let provider = provider_from_path(uri.path()).unwrap_or("");
    let Some(auth) = authorize_url(&state, provider) else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let mut session = slot.lock().await;
    let nonce = uuid::Uuid::new_v4().to_string();
    session.raw["oauthState"] = serde_json::Value::String(nonce.clone());
    if let Some(socket) = query_param(uri.query().unwrap_or(""), "socketId") {
        session.socket_id = Some(socket);
    }
    state.sessions.save(&session).await;
    state.sessions.remember_oauth_tx(&nonce, &session.id).await;
    let mut target = auth;
    target.push_str(if target.contains('?') { "&" } else { "?" });
    target.push_str(&format!("state={}", urlencoding::encode(&nonce)));
    redirect(&state, &session, target)
}

async fn callback_oauth(
    State(state): State<AppState>,
    Extension(slot): Extension<Arc<Mutex<Session>>>,
    Query(query): Query<CallbackQuery>,
    axum::extract::OriginalUri(uri): axum::extract::OriginalUri,
) -> Response {
    let provider = provider_from_path(uri.path())
        .unwrap_or("")
        .trim_end_matches("/callback")
        .to_owned();
    let Some(code) = query.code else {
        return StatusCode::FORBIDDEN.into_response();
    };
    let Some(expected) = query.state.clone() else {
        tracing::warn!(provider, "oauth callback missing state");
        return StatusCode::FORBIDDEN.into_response();
    };
    let mut session = slot.lock().await.clone();
    if !prepare_callback_session(&state, &mut session, "oauthState", &expected).await {
        tracing::warn!(provider, "oauth state did not match the session");
        return StatusCode::FORBIDDEN.into_response();
    }
    let profile = match exchange(&state, &provider, &code).await {
        Ok(profile) => profile,
        Err(error) => {
            tracing::warn!(%error, provider, "oauth token exchange failed");
            return StatusCode::FORBIDDEN.into_response();
        }
    };
    let response = finish_login(&state, &mut session, profile).await;
    *slot.lock().await = session;
    response
}

/// The provider redirects the popup without the session cookie, so the request
/// looks like a new empty session. The `state` value still identifies the
/// session that started the login. A session that is already logged in, or
/// waiting on a different return, is left as it is.
async fn prepare_callback_session(
    state: &AppState,
    session: &mut Session,
    field: &str,
    expected: &str,
) -> bool {
    let current = session.raw.get(field).and_then(Value::as_str);
    let stored = state.sessions.oauth_tx(expected).await;
    match bind_oauth(
        current,
        expected,
        session.passport_user.is_some(),
        stored.is_some(),
    ) {
        OauthBind::Keep => {
            state.sessions.forget_oauth_tx(expected).await;
            true
        }
        OauthBind::Swap => {
            let Some(sid) = stored else {
                return false;
            };
            let Some(loaded) = state.sessions.load(&sid).await else {
                return false;
            };
            if loaded.raw.get(field).and_then(Value::as_str) != Some(expected) {
                return false;
            }
            *session = loaded;
            state.sessions.forget_oauth_tx(expected).await;
            true
        }
        OauthBind::Reject => false,
    }
}

#[derive(Debug, PartialEq, Eq)]
enum OauthBind {
    Keep,
    Swap,
    Reject,
}

fn bind_oauth(current: Option<&str>, expected: &str, logged_in: bool, have_tx: bool) -> OauthBind {
    if current == Some(expected) {
        return OauthBind::Keep;
    }
    if have_tx && !logged_in && current.is_none() {
        OauthBind::Swap
    } else {
        OauthBind::Reject
    }
}

pub(super) async fn finish_login(
    state: &AppState,
    session: &mut Session,
    profile: Registration,
) -> Response {
    let identity = match db::register_user(&state.db, profile).await {
        Ok(identity) => identity,
        Err(error) => {
            tracing::warn!(%error, "oauth registration failed");
            return StatusCode::FORBIDDEN.into_response();
        }
    };
    if let Some((user_id, _)) = session.user_ids() {
        if let Some(anon) = db::user_by_identity(
            &state.db,
            &session.user_ids().map(|ids| ids.1).unwrap_or_default(),
            false,
        )
        .await
        .ok()
        .flatten()
        {
            if anon.account_type == "anonymous" && anon.id != identity.user_id {
                let _ = db::merge_users(&state.db, &identity.id, &[anon.identity_id], false).await;
            }
        }
        let _ = user_id;
    }
    session.passport_user = Some(user_ids(&identity.user_id, &identity.id));
    state.sessions.save(session).await;
    if let Some(socket_id) = session.socket_id.clone() {
        if let Some(io) = state.io.get() {
            let payload =
                serde_json::json!({ "userId": identity.user_id, "identityId": identity.id });
            io.emit_to(&socket_id, "auth", &payload).await;
        }
    }
    let mut response =
        (StatusCode::OK, [(header::CONTENT_TYPE, "application/json")]).into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        state
            .sessions
            .set_cookie_header(&session.id)
            .parse()
            .unwrap(),
    );
    response
}

fn authorize_url(state: &AppState, provider: &str) -> Option<String> {
    let callback = format!("{}/api/auth/{provider}/callback", state.config.base_url);
    let callback = urlencoding::encode(&callback);
    match provider {
        "google" if !state.config.google_key.is_empty() => Some(format!(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={callback}&response_type=code&scope=openid%20email%20profile",
            state.config.google_key
        )),
        "github" if !state.config.github_key.is_empty() => Some(format!(
            "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={callback}&scope=user:email",
            state.config.github_key
        )),
        "slack" if !state.config.slack_key.is_empty() => Some(format!(
            "https://slack.com/oauth/v2/authorize?client_id={}&redirect_uri={callback}&user_scope=identity.basic,identity.email,identity.avatar,identity.team",
            state.config.slack_key
        )),
        "microsoft" if !state.config.microsoft_key.is_empty() => {
            let tenant = state.config.microsoft_tenant.as_deref().unwrap_or("common");
            let url = state.config.microsoft_authorization_url.clone().unwrap_or_else(|| {
                format!("https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize")
            });
            Some(format!("{url}?client_id={}&redirect_uri={callback}&response_type=code&scope=user.read", state.config.microsoft_key))
        }
        "okta" if !state.config.okta_key.is_empty() => Some(format!(
            "{}/v1/authorize?client_id={}&redirect_uri={callback}&response_type=code&scope=openid%20email%20profile",
            state.config.okta_audience.trim_end_matches('/'),
            state.config.okta_key
        )),
        _ => None,
    }
}

async fn exchange(state: &AppState, provider: &str, code: &str) -> Result<Registration, String> {
    let callback = format!("{}/api/auth/{provider}/callback", state.config.base_url);
    let client = reqwest::Client::new();
    let (token_url, id, secret) = match provider {
        "google" => (
            "https://oauth2.googleapis.com/token",
            state.config.google_key.as_str(),
            state.config.google_secret.as_str(),
        ),
        "github" => (
            "https://github.com/login/oauth/access_token",
            state.config.github_key.as_str(),
            state.config.github_secret.as_str(),
        ),
        "slack" => (
            "https://slack.com/api/oauth.v2.access",
            state.config.slack_key.as_str(),
            state.config.slack_secret.as_str(),
        ),
        "microsoft" => {
            let url = state.config.microsoft_token_url.clone().unwrap_or_else(|| {
                let tenant = state.config.microsoft_tenant.as_deref().unwrap_or("common");
                format!("https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token")
            });
            return exchange_form(
                &client,
                &url,
                &state.config.microsoft_key,
                &state.config.microsoft_secret,
                code,
                &callback,
                provider,
            )
            .await;
        }
        "okta" => {
            let url = format!(
                "{}/v1/token",
                state.config.okta_audience.trim_end_matches('/')
            );
            return exchange_form(
                &client,
                &url,
                &state.config.okta_key,
                &state.config.okta_secret,
                code,
                &callback,
                provider,
            )
            .await;
        }
        _ => return Err("unknown provider".into()),
    };
    exchange_form(&client, token_url, id, secret, code, &callback, provider).await
}

async fn exchange_form(
    client: &reqwest::Client,
    url: &str,
    id: &str,
    secret: &str,
    code: &str,
    callback: &str,
    provider: &str,
) -> Result<Registration, String> {
    let response = client
        .post(url)
        .header(header::ACCEPT, "application/json")
        .form(&[
            ("client_id", id),
            ("client_secret", secret),
            ("code", code),
            ("redirect_uri", callback),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|error| error.to_string())?;
    let body: Value = response.json().await.map_err(|error| error.to_string())?;
    let token = body
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "missing token".to_owned())?;
    profile(client, provider, token, &body).await
}

async fn profile(
    client: &reqwest::Client,
    provider: &str,
    token: &str,
    token_body: &Value,
) -> Result<Registration, String> {
    match provider {
        "google" => {
            let user: Value = client
                .get("https://www.googleapis.com/oauth2/v2/userinfo")
                .bearer_auth(token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .map_err(|e| e.to_string())?;
            let email = user
                .get("email")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_owned();
            Ok(Registration {
                account_type: "google".into(),
                name: user
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(&email)
                    .into(),
                username: email.clone(),
                email,
                password: None,
                email_verified: false,
                email_verification: None,
                language: None,
                photo: user
                    .get("picture")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                slack_user_id: None,
                slack_team_id: None,
            })
        }
        "github" => {
            let user: Value = client
                .get("https://api.github.com/user")
                .header("User-Agent", "retrospected")
                .bearer_auth(token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .map_err(|e| e.to_string())?;
            let emails: Value = client
                .get("https://api.github.com/user/emails")
                .header("User-Agent", "retrospected")
                .bearer_auth(token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .unwrap_or(Value::Null);
            let email = emails
                .as_array()
                .and_then(|list| {
                    list.iter()
                        .find_map(|item| item.get("email").and_then(Value::as_str))
                })
                .unwrap_or("")
                .to_owned();
            let username = user
                .get("login")
                .and_then(Value::as_str)
                .unwrap_or(&email)
                .to_owned();
            Ok(Registration {
                account_type: "github".into(),
                name: user
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(&username)
                    .into(),
                username,
                email,
                password: None,
                email_verified: false,
                email_verification: None,
                language: None,
                photo: user
                    .get("avatar_url")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                slack_user_id: None,
                slack_team_id: None,
            })
        }
        "slack" => {
            let user = token_body
                .get("authed_user")
                .cloned()
                .unwrap_or(Value::Null);
            let email = user
                .pointer("/email")
                .and_then(Value::as_str)
                .or_else(|| token_body.pointer("/user/email").and_then(Value::as_str))
                .unwrap_or("")
                .to_owned();
            Ok(Registration {
                account_type: "slack".into(),
                name: user
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(&email)
                    .into(),
                username: email.clone(),
                email,
                password: None,
                email_verified: false,
                email_verification: None,
                language: None,
                photo: user
                    .get("image_192")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                slack_user_id: user.get("id").and_then(Value::as_str).map(str::to_owned),
                slack_team_id: token_body
                    .pointer("/team/id")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
            })
        }
        "microsoft" => {
            let user: Value = client
                .get("https://graph.microsoft.com/v1.0/me")
                .bearer_auth(token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .map_err(|e| e.to_string())?;
            let email = user
                .get("mail")
                .and_then(Value::as_str)
                .or_else(|| user.get("userPrincipalName").and_then(Value::as_str))
                .unwrap_or("")
                .to_owned();
            Ok(Registration {
                account_type: "microsoft".into(),
                name: user
                    .get("displayName")
                    .and_then(Value::as_str)
                    .unwrap_or(&email)
                    .into(),
                username: email.clone(),
                email,
                password: None,
                email_verified: false,
                email_verification: None,
                language: None,
                photo: None,
                slack_user_id: None,
                slack_team_id: None,
            })
        }
        "okta" => {
            let email = token_body
                .get("email")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_owned();
            let name = token_body
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or(&email)
                .to_owned();
            Ok(Registration {
                account_type: "okta".into(),
                name,
                username: email.clone(),
                email,
                password: None,
                email_verified: false,
                email_verification: None,
                language: None,
                photo: None,
                slack_user_id: None,
                slack_team_id: None,
            })
        }
        _ => Err("profile".into()),
    }
}

fn provider_from_path(path: &str) -> Option<&str> {
    path.trim_end_matches("/callback").rsplit('/').next()
}

pub(super) fn query_param(query: &str, name: &str) -> Option<String> {
    query.split('&').find_map(|part| {
        let (key, value) = part.split_once('=')?;
        (key == name).then(|| {
            urlencoding::decode(value)
                .ok()
                .map(|v| v.into_owned())
                .unwrap_or_else(|| value.to_owned())
        })
    })
}

pub(super) fn redirect(state: &AppState, session: &Session, location: String) -> Response {
    let mut response = Redirect::temporary(&location).into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        state
            .sessions
            .set_cookie_header(&session.id)
            .parse()
            .unwrap(),
    );
    response
}

#[cfg(test)]
mod tests {
    use super::{bind_oauth, OauthBind};

    #[test]
    fn keeps_the_session_that_started_oauth() {
        assert_eq!(
            bind_oauth(Some("nonce"), "nonce", false, true),
            OauthBind::Keep
        );
    }

    #[test]
    fn swaps_when_the_popup_lost_the_cookie() {
        assert_eq!(bind_oauth(None, "nonce", false, true), OauthBind::Swap);
    }

    #[test]
    fn rejects_a_logged_in_session_and_a_different_pending_login() {
        assert_eq!(bind_oauth(None, "nonce", true, true), OauthBind::Reject);
        assert_eq!(
            bind_oauth(Some("other"), "nonce", false, true),
            OauthBind::Reject
        );
        assert_eq!(bind_oauth(None, "nonce", false, false), OauthBind::Reject);
    }
}
