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
    if !oauth_cookie_matches(&session, "oauthState", &expected) {
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

/// The callback must present the session cookie written when the popup started
/// the redirect. `state` alone must not select another session.
fn oauth_cookie_matches(session: &Session, field: &str, expected: &str) -> bool {
    session.raw.get(field).and_then(Value::as_str) == Some(expected)
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
                state,
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
                state,
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
    exchange_form(
        state, &client, token_url, id, secret, code, &callback, provider,
    )
    .await
}

async fn exchange_form(
    state: &AppState,
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
    profile(state, client, provider, token, &body).await
}

async fn profile(
    state: &AppState,
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
            let raw_email = user.get("email").and_then(Value::as_str).unwrap_or("");
            let verified = user
                .get("verified_email")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            let email = if verified {
                raw_email.to_owned()
            } else {
                String::new()
            };
            let username = if raw_email.is_empty() {
                user.get("id")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_owned()
            } else {
                raw_email.to_owned()
            };
            Ok(Registration {
                account_type: "google".into(),
                name: user
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(if username.is_empty() {
                        "Google"
                    } else {
                        &username
                    })
                    .into(),
                username,
                email,
                password: None,
                email_verified: verified && !raw_email.is_empty(),
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
            let email = github_email(&emails).unwrap_or_default();
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
                email: email.clone(),
                password: None,
                email_verified: !email.is_empty(),
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
            let user_token = token_body
                .pointer("/authed_user/access_token")
                .and_then(Value::as_str)
                .unwrap_or(token);
            let identity: Value = client
                .get("https://slack.com/api/users.identity")
                .bearer_auth(user_token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .map_err(|e| e.to_string())?;
            slack_registration(&identity)
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
            let username = if email.is_empty() {
                user.get("id")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_owned()
            } else {
                email.clone()
            };
            Ok(Registration {
                account_type: "microsoft".into(),
                name: user
                    .get("displayName")
                    .and_then(Value::as_str)
                    .unwrap_or(if username.is_empty() {
                        "Microsoft"
                    } else {
                        &username
                    })
                    .into(),
                username,
                email: email.clone(),
                password: None,
                email_verified: !email.is_empty(),
                email_verification: None,
                language: None,
                photo: None,
                slack_user_id: None,
                slack_team_id: None,
            })
        }
        "okta" => {
            let url = format!(
                "{}/v1/userinfo",
                state.config.okta_audience.trim_end_matches('/')
            );
            let user: Value = client
                .get(url)
                .bearer_auth(token)
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json()
                .await
                .map_err(|e| e.to_string())?;
            okta_registration(&user)
        }
        _ => Err("profile".into()),
    }
}

/// Primary verified GitHub address, otherwise any verified address.
fn github_email(emails: &Value) -> Option<String> {
    let list = emails.as_array()?;
    let verified = |item: &&Value| item.get("verified").and_then(Value::as_bool) == Some(true);
    let address = |item: &Value| item.get("email").and_then(Value::as_str).map(str::to_owned);
    list.iter()
        .find(|item| verified(item) && item.get("primary").and_then(Value::as_bool) == Some(true))
        .or_else(|| list.iter().find(verified))
        .and_then(address)
}

fn slack_registration(identity: &Value) -> Result<Registration, String> {
    if identity.get("ok").and_then(Value::as_bool) == Some(false) {
        return Err("slack identity".into());
    }
    let email = identity
        .pointer("/user/email")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_owned();
    let id = identity
        .pointer("/user/id")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_owned();
    if id.is_empty() {
        return Err("slack user".into());
    }
    let name = identity
        .pointer("/user/name")
        .and_then(Value::as_str)
        .unwrap_or(if email.is_empty() { &id } else { &email })
        .to_owned();
    Ok(Registration {
        account_type: "slack".into(),
        name,
        username: id.clone(),
        email: email.clone(),
        password: None,
        email_verified: !email.is_empty(),
        email_verification: None,
        language: None,
        photo: identity
            .pointer("/user/image_192")
            .and_then(Value::as_str)
            .map(str::to_owned),
        slack_user_id: Some(id),
        slack_team_id: identity
            .pointer("/team/id")
            .and_then(Value::as_str)
            .map(str::to_owned),
    })
}

fn okta_registration(user: &Value) -> Result<Registration, String> {
    let email = user.get("email").and_then(Value::as_str).unwrap_or("");
    let verified = user
        .get("email_verified")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    if email.is_empty() || !verified {
        return Err("okta email is not verified".into());
    }
    let sub = user.get("sub").and_then(Value::as_str).unwrap_or("");
    if sub.is_empty() {
        return Err("okta subject".into());
    }
    let name = user
        .get("name")
        .and_then(Value::as_str)
        .unwrap_or(email)
        .to_owned();
    Ok(Registration {
        account_type: "okta".into(),
        name,
        username: sub.to_owned(),
        email: email.to_owned(),
        password: None,
        email_verified: true,
        email_verification: None,
        language: None,
        photo: None,
        slack_user_id: None,
        slack_team_id: None,
    })
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
    use serde_json::json;

    use super::{github_email, oauth_cookie_matches, okta_registration, slack_registration};
    use crate::session::Session;

    fn session_with(field: &str, value: Option<&str>) -> Session {
        let mut raw = json!({});
        if let Some(value) = value {
            raw[field] = json!(value);
        }
        Session {
            id: "sid".into(),
            passport_user: None,
            socket_id: None,
            raw,
        }
    }

    #[test]
    fn keeps_the_session_that_started_oauth() {
        let session = session_with("oauthState", Some("nonce"));
        assert!(oauth_cookie_matches(&session, "oauthState", "nonce"));
    }

    #[test]
    fn rejects_a_callback_without_the_starter_cookie() {
        let empty = session_with("oauthState", None);
        assert!(!oauth_cookie_matches(&empty, "oauthState", "nonce"));
        let other = session_with("oauthState", Some("other"));
        assert!(!oauth_cookie_matches(&other, "oauthState", "nonce"));
    }

    #[test]
    fn github_email_skips_unverified_addresses() {
        let emails = json!([
            {"email": "unverified@example.com", "primary": true, "verified": false},
            {"email": "ada@example.com", "primary": false, "verified": true}
        ]);
        assert_eq!(github_email(&emails).as_deref(), Some("ada@example.com"));
        let primary = json!([
            {"email": "other@example.com", "primary": false, "verified": true},
            {"email": "ada@example.com", "primary": true, "verified": true}
        ]);
        assert_eq!(github_email(&primary).as_deref(), Some("ada@example.com"));
    }

    #[test]
    fn slack_identity_uses_the_user_id_and_okta_requires_a_verified_email() {
        let slack = slack_registration(&json!({
            "ok": true,
            "user": {"id": "U1", "name": "Ada", "email": "ada@example.com"},
            "team": {"id": "T1"}
        }))
        .unwrap();
        assert_eq!(slack.username, "U1");
        assert!(slack.email_verified);
        assert!(okta_registration(&json!({"email": "ada@example.com"})).is_err());
        let okta = okta_registration(&json!({
            "sub": "00u",
            "email": "ada@example.com",
            "email_verified": true,
            "name": "Ada"
        }))
        .unwrap();
        assert_eq!(okta.username, "00u");
        assert!(okta.email_verified);
    }
}
