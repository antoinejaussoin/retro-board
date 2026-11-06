use std::collections::HashMap;

use std::sync::Arc;

use axum::extract::{Query, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Extension;
use hmac::Mac;
use serde_json::Value;
use tokio::sync::Mutex;

use crate::db::Registration;
use crate::session::Session;
use crate::state::AppState;

use super::{finish_login, prepare_callback_session, query_param, redirect, CallbackQuery};

pub(super) async fn start_twitter(
    State(state): State<AppState>,
    Extension(slot): Extension<Arc<Mutex<Session>>>,
    axum::extract::OriginalUri(uri): axum::extract::OriginalUri,
) -> Response {
    if state.config.twitter_key.is_empty() {
        return StatusCode::NOT_FOUND.into_response();
    }
    let callback = format!("{}/api/auth/twitter/callback", state.config.base_url);
    let Ok(token) = twitter_request_token(
        &state.config.twitter_key,
        &state.config.twitter_secret,
        &callback,
    )
    .await
    else {
        return StatusCode::BAD_GATEWAY.into_response();
    };
    let mut session = slot.lock().await;
    session.raw["twitterToken"] = serde_json::Value::String(token.0.clone());
    session.raw["twitterSecret"] = serde_json::Value::String(token.1);
    if let Some(socket) = query_param(uri.query().unwrap_or(""), "socketId") {
        session.socket_id = Some(socket);
    }
    state.sessions.save(&session).await;
    state
        .sessions
        .remember_oauth_tx(&token.0, &session.id)
        .await;
    redirect(
        &state,
        &session,
        format!(
            "https://api.twitter.com/oauth/authenticate?oauth_token={}",
            token.0
        ),
    )
}

pub(super) async fn callback_twitter(
    State(state): State<AppState>,
    Extension(slot): Extension<Arc<Mutex<Session>>>,
    Query(query): Query<CallbackQuery>,
) -> Response {
    let (Some(token), Some(verifier)) = (query.oauth_token, query.oauth_verifier) else {
        return StatusCode::FORBIDDEN.into_response();
    };
    let mut session = slot.lock().await.clone();
    if !prepare_callback_session(&state, &mut session, "twitterToken", &token).await {
        return StatusCode::FORBIDDEN.into_response();
    }
    let secret = session
        .raw
        .get("twitterSecret")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_owned();
    let Ok(profile) = twitter_access(&state, &token, &secret, &verifier).await else {
        return StatusCode::FORBIDDEN.into_response();
    };
    let response = finish_login(&state, &mut session, profile).await;
    *slot.lock().await = session;
    response
}

async fn twitter_request_token(
    key: &str,
    secret: &str,
    callback: &str,
) -> Result<(String, String), String> {
    let url = "https://api.twitter.com/oauth/request_token";
    let auth = oauth1_header(
        "POST",
        url,
        key,
        secret,
        None,
        None,
        &[("oauth_callback", callback)],
    );
    let text = reqwest::Client::new()
        .post(url)
        .header(header::AUTHORIZATION, auth)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    let map = form_map(&text);
    Ok((
        map.get("oauth_token").cloned().ok_or("token")?,
        map.get("oauth_token_secret").cloned().ok_or("secret")?,
    ))
}

async fn twitter_access(
    state: &AppState,
    token: &str,
    token_secret: &str,
    verifier: &str,
) -> Result<Registration, String> {
    let url = "https://api.twitter.com/oauth/access_token";
    let auth = oauth1_header(
        "POST",
        url,
        &state.config.twitter_key,
        &state.config.twitter_secret,
        Some(token),
        Some(token_secret),
        &[("oauth_verifier", verifier)],
    );
    let text = reqwest::Client::new()
        .post(url)
        .header(header::AUTHORIZATION, auth)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    let map = form_map(&text);
    let access = map.get("oauth_token").cloned().ok_or("token")?;
    let access_secret = map.get("oauth_token_secret").cloned().ok_or("secret")?;
    let verify = "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true";
    let auth = oauth1_header(
        "GET",
        "https://api.twitter.com/1.1/account/verify_credentials.json",
        &state.config.twitter_key,
        &state.config.twitter_secret,
        Some(&access),
        Some(&access_secret),
        &[("include_email", "true")],
    );
    let user: Value = reqwest::Client::new()
        .get(verify)
        .header(header::AUTHORIZATION, auth)
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
    let username = user
        .get("screen_name")
        .and_then(Value::as_str)
        .unwrap_or(&email)
        .to_owned();
    Ok(Registration {
        account_type: "twitter".into(),
        name: user
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or(&username)
            .into(),
        username,
        email,
        password: None,
        email_verification: None,
        language: None,
        photo: user
            .get("profile_image_url_https")
            .and_then(Value::as_str)
            .map(str::to_owned),
        slack_user_id: None,
        slack_team_id: None,
    })
}

fn oauth1_header(
    method: &str,
    url: &str,
    key: &str,
    secret: &str,
    token: Option<&str>,
    token_secret: Option<&str>,
    extra: &[(&str, &str)],
) -> String {
    let nonce = uuid::Uuid::new_v4().simple().to_string();
    let timestamp = chrono::Utc::now().timestamp().to_string();
    let mut params: Vec<(String, String)> = vec![
        ("oauth_consumer_key".into(), key.into()),
        ("oauth_nonce".into(), nonce.clone()),
        ("oauth_signature_method".into(), "HMAC-SHA1".into()),
        ("oauth_timestamp".into(), timestamp.clone()),
        ("oauth_version".into(), "1.0".into()),
    ];
    if let Some(token) = token {
        params.push(("oauth_token".into(), token.into()));
    }
    for (name, value) in extra {
        params.push(((*name).into(), (*value).into()));
    }
    params.sort();
    let param_string = params
        .iter()
        .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
        .collect::<Vec<_>>()
        .join("&");
    let base = format!(
        "{}&{}&{}",
        method,
        urlencoding::encode(url),
        urlencoding::encode(&param_string)
    );
    let signing_key = format!(
        "{}&{}",
        urlencoding::encode(secret),
        urlencoding::encode(token_secret.unwrap_or(""))
    );
    let mut mac = hmac::Hmac::<sha1::Sha1>::new_from_slice(signing_key.as_bytes()).expect("hmac");
    mac.update(base.as_bytes());
    let signature = base64::Engine::encode(
        &base64::engine::general_purpose::STANDARD,
        mac.finalize().into_bytes(),
    );
    let mut header_params = params;
    header_params.retain(|(name, _)| name.starts_with("oauth_"));
    header_params.push(("oauth_signature".into(), signature));
    let rendered = header_params
        .iter()
        .map(|(k, v)| format!(r#"{k}="{}""#, urlencoding::encode(v)))
        .collect::<Vec<_>>()
        .join(", ");
    format!("OAuth {rendered}")
}

fn form_map(body: &str) -> HashMap<String, String> {
    body.split('&')
        .filter_map(|part| {
            let (key, value) = part.split_once('=')?;
            Some((
                urlencoding::decode(key).ok()?.into_owned(),
                urlencoding::decode(value).ok()?.into_owned(),
            ))
        })
        .collect()
}
