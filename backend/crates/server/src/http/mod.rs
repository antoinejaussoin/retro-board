//! HTTP routes preserved from the TypeScript server.

mod account;
mod admin;
mod ai;
mod auth;
mod billing;
mod board;
mod slack;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{delete, get, patch, post};
use axum::Router;
use serde_json::json;
use tokio::sync::Mutex;

use crate::session::Session;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/ping", get(|| async { "pong" }))
        .route("/healthz", get(|| async { StatusCode::OK }))
        .route("/api/auth/anonymous/login", post(auth::login))
        .route("/api/auth/login", post(auth::login))
        .nest("/api/auth", crate::oauth::router())
        .route("/api/stripe/webhook", post(billing::stripe_webhook))
        .route(
            "/api/stripe/create-checkout-session",
            post(billing::checkout),
        )
        .route("/api/stripe/products", get(billing::products))
        .route("/api/stripe/portal", get(billing::portal))
        .route(
            "/api/stripe/members",
            get(billing::members).patch(billing::patch_members),
        )
        .route("/api/stripe/admins", patch(billing::patch_admins))
        .route("/api/stripe/domain/{domain}", get(billing::domain_ok))
        .route("/api/stripe/start-trial", post(billing::start_trial))
        .route("/api/admin/self-hosting", get(admin::capabilities))
        .route("/api/admin/users", get(admin::admin_users))
        .route("/api/admin/user", patch(admin::admin_password))
        .route("/api/admin/merge", post(admin::admin_merge))
        .route("/api/admin/stats", get(admin::admin_stats))
        .route("/api/slack/create", post(slack::slack_create))
        .route("/api/ai/chat", post(ai::ai_chat))
        .route(
            "/api/ai/summary/{id}",
            get(ai::ai_summary_stored).patch(ai::ai_summary_edit),
        )
        .route("/api/ai/summary", post(ai::ai_summary))
        .route("/api/create", post(board::create_session))
        .route("/api/demo", post(board::create_demo))
        .route("/api/logout", post(auth::logout))
        .route("/api/me", get(auth::me))
        .route("/api/me/username", post(auth::rename_user))
        .route("/api/me", delete(account::delete_me))
        .route("/api/quota", get(board::quota))
        .route("/api/previous", get(board::previous))
        .route("/api/session/{session_id}", delete(board::delete_session))
        .route("/api/me/language", post(auth::language))
        .route("/api/me/default-template", get(board::default_template))
        .route("/api/register", post(auth::register))
        .route("/api/user/{identity_id}", delete(admin::admin_delete_user))
        .route("/api/user", post(admin::admin_create_user))
        .route("/api/users", get(board::related))
        .route("/api/validate", post(auth::validate))
        .route("/api/reset", post(auth::reset))
        .route("/api/reset-password", post(auth::reset_password))
        .route("/api/self-hosted", post(billing::self_hosted_bool))
        .route("/api/self-hosted-licence", post(billing::self_hosted_meta))
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
    if response.headers().get(header::SET_COOKIE).is_some() {
        return response;
    }
    if let Ok(value) = state.sessions.set_cookie_header(session_id).parse() {
        response.headers_mut().insert(header::SET_COOKIE, value);
    }
    response
}

pub(crate) fn client_ip(
    headers: &HeaderMap,
    addr: Option<SocketAddr>,
    trusted: &[String],
) -> String {
    let peer = addr.map(|addr| addr.ip());
    if peer.is_some_and(|ip| proxy_peer(ip, trusted)) {
        if let Some(forwarded) = forwarded_for(headers) {
            return forwarded;
        }
    }
    peer.map(|ip| ip.to_string())
        .unwrap_or_else(|| "unknown".into())
}

fn forwarded_for(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn proxy_peer(ip: std::net::IpAddr, trusted: &[String]) -> bool {
    ip.is_loopback() || is_private(ip) || trusted.iter().any(|entry| proxy_entry(ip, entry))
}

fn is_private(ip: std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(ip) => ip.is_private(),
        std::net::IpAddr::V6(ip) => {
            let bits = u128::from(ip);
            (bits & (0xfe << 120)) == (0xfc << 120)
        }
    }
}

fn proxy_entry(ip: std::net::IpAddr, entry: &str) -> bool {
    if let Ok(exact) = entry.parse::<std::net::IpAddr>() {
        return ip == exact;
    }
    let Some((base, bits)) = entry.split_once('/') else {
        return false;
    };
    let Ok(bits) = bits.parse::<u32>() else {
        return false;
    };
    match (ip, base.parse::<std::net::Ipv4Addr>()) {
        (std::net::IpAddr::V4(ip), Ok(base)) if bits <= 32 => {
            let mask = if bits == 0 {
                0
            } else {
                u32::MAX << (32 - bits)
            };
            (u32::from(ip) & mask) == (u32::from(base) & mask)
        }
        _ => false,
    }
}

pub(super) async fn limited(
    state: &AppState,
    headers: &HeaderMap,
    addr: Option<SocketAddr>,
) -> bool {
    state
        .http_limit
        .allow(&client_ip(headers, addr, &state.config.trusted_proxies))
        .await
}

pub(super) fn empty(status: StatusCode) -> Response {
    (status, [(header::CONTENT_TYPE, "application/json")]).into_response()
}

pub(super) fn text(status: StatusCode, body: &str) -> Response {
    (status, body.to_owned()).into_response()
}

#[cfg(test)]
mod tests {
    use super::client_ip;
    use axum::http::HeaderMap;

    #[test]
    fn public_peer_ignores_a_spoofed_forwarded_for() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "1.2.3.4".parse().unwrap());
        let public = "8.8.8.8:443".parse().unwrap();
        assert_eq!(client_ip(&headers, Some(public), &[]), "8.8.8.8");
        let local = "127.0.0.1:8081".parse().unwrap();
        assert_eq!(client_ip(&headers, Some(local), &[]), "1.2.3.4");
        let listed = "203.0.113.9:443".parse().unwrap();
        assert_eq!(
            client_ip(&headers, Some(listed), &["203.0.113.0/24".into()]),
            "1.2.3.4"
        );
    }
}
