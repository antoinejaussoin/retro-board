use std::sync::Arc;

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use tokio::sync::Mutex;

use super::text;
use crate::db::{self};
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn ai_chat(
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
        state.config.ai_free_limit,
        state.config.ai_paid_limit,
    )
    .await
    .unwrap_or(0.0);
    if allowance > 1.0 {
        return text(
            StatusCode::PAYMENT_REQUIRED,
            "You have reached your monthly allowance of messages",
        );
    }
    if state.config.anthropic_api_key.is_empty() {
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
    let answer = match crate::ai::complete(
        &state.config.anthropic_api_key,
        &state.config.anthropic_model,
        &messages,
    )
    .await
    {
        Ok(answer) => answer,
        Err(error) => {
            tracing::warn!(%error, "anthropic");
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
