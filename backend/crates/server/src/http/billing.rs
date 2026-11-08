use std::net::SocketAddr;
use std::sync::Arc;

use axum::body::Bytes;
use axum::extract::{ConnectInfo, Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use serde_json::{json, Value};
use tokio::sync::Mutex;

use super::{empty, limited, text};
use crate::crypto::stripe_signature_valid;
use crate::db::{self};
use crate::email;
use crate::models::{CheckoutPayload, LicencePayload};
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn self_hosted_bool(
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

pub(super) async fn self_hosted_meta(
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

pub(super) async fn products() -> Json<Vec<crate::models::Product>> {
    Json(crate::stripe::products())
}

pub(super) async fn stripe_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> StatusCode {
    if state.config.stripe_webhook_secret.is_empty() {
        tracing::warn!("stripe webhook secret is empty");
        return StatusCode::BAD_REQUEST;
    }
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

pub(super) async fn checkout(
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

pub(super) async fn portal(
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

pub(super) async fn members(
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

pub(super) async fn patch_members(
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

pub(super) async fn patch_admins(
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

pub(super) async fn domain_ok(Path(domain): Path<String>) -> Json<bool> {
    Json(crate::domains::is_valid(&domain))
}

pub(super) async fn start_trial(
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
