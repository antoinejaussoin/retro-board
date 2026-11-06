use std::sync::Arc;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use tokio::sync::Mutex;

use super::text;
use crate::db::{self};
use crate::models::{AiSummaryResponse, Board, CoachMessage, FullUser, StoredAiSummaryResponse};
use crate::session::Session;
use crate::state::AppState;

pub(super) async fn ai_chat(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<crate::models::AiChatPayload>,
) -> Response {
    let Some(user) = logged_in_user(&state, &session).await else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    if let Some(response) = allowance_or_config(&state, &user).await {
        return response;
    }
    let mut messages = body.messages.clone();
    if !messages.iter().any(|message| message.role == "system") {
        messages.insert(
            0,
            CoachMessage {
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
    // Quota history is best-effort: a failed insert must not hide a successful answer.
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
    response.push(CoachMessage {
        role: "assistant".into(),
        content: Some(answer),
    });
    Json(response).into_response()
}

pub(super) async fn ai_summary(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Json(body): Json<crate::models::AiSummaryPayload>,
) -> Response {
    let Some(user) = logged_in_user(&state, &session).await else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    let board = match open_summary_board(&state, &user, &body.id).await {
        Ok(board) => board,
        Err(response) => return *response,
    };
    if let Some(response) = allowance_or_config(&state, &user).await {
        return response;
    }
    let prompt = summary_prompt_for(&state, &board);
    let messages = vec![
        CoachMessage {
            role: "system".into(),
            content: Some(crate::ai::SUMMARY_SYSTEM.into()),
        },
        CoachMessage {
            role: "user".into(),
            content: Some(prompt.clone()),
        },
    ];
    let summary = match crate::ai::complete(
        &state.config.anthropic_api_key,
        &state.config.anthropic_model,
        &messages,
    )
    .await
    {
        Ok(summary) => summary,
        Err(error) => {
            tracing::warn!(%error, "anthropic");
            return text(StatusCode::INTERNAL_SERVER_ERROR, "AI request failed");
        }
    };
    let fingerprint = crate::ai::summary_fingerprint(&prompt);
    if let Err(error) = db::save_ai_summary(&state.db, &board.id, &summary, &fingerprint).await {
        tracing::warn!(%error, "save summary");
        return text(StatusCode::INTERNAL_SERVER_ERROR, "AI request failed");
    }
    // Quota history is a marker, not the board, so the allowance counts without a second copy.
    let _ = db::record_ai(&state.db, &board.id, &user.id, "user", "retro-summary").await;
    Json(AiSummaryResponse { summary }).into_response()
}

pub(super) async fn ai_summary_stored(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Path(id): Path<String>,
) -> Response {
    let Some(user) = logged_in_user(&state, &session).await else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    let board = match open_summary_board(&state, &user, &id).await {
        Ok(board) => board,
        Err(response) => return *response,
    };
    Json(stored_summary(&state, &board).await).into_response()
}

pub(super) async fn ai_summary_edit(
    State(state): State<AppState>,
    Extension(session): Extension<Arc<Mutex<Session>>>,
    Path(id): Path<String>,
    Json(body): Json<crate::models::EditAiSummaryPayload>,
) -> Response {
    let Some(user) = logged_in_user(&state, &session).await else {
        return text(
            StatusCode::UNAUTHORIZED,
            "You need to be logged in to use this feature",
        );
    };
    if let Err(response) = open_summary_board(&state, &user, &id).await {
        return *response;
    }
    let summary = body.summary.trim().to_owned();
    let saved = match db::update_ai_summary(&state.db, &id, &summary).await {
        Ok(saved) => saved,
        Err(error) => {
            tracing::warn!(%error, "edit summary");
            return text(StatusCode::INTERNAL_SERVER_ERROR, "AI request failed");
        }
    };
    if !saved {
        return text(StatusCode::NOT_FOUND, "Session not found");
    }
    Json(AiSummaryResponse { summary }).into_response()
}

async fn open_summary_board(
    state: &AppState,
    user: &FullUser,
    session_id: &str,
) -> Result<Board, Box<Response>> {
    let access = match db::access(&state.db, session_id).await {
        Ok(Some(access)) => access,
        Ok(None) => return Err(Box::new(text(StatusCode::NOT_FOUND, "Session not found"))),
        Err(error) => {
            tracing::warn!(%error, "summary access");
            return Err(Box::new(text(
                StatusCode::INTERNAL_SERVER_ERROR,
                "AI request failed",
            )));
        }
    };
    if access.encrypted.is_some() {
        return Err(Box::new(text(
            StatusCode::FORBIDDEN,
            "AI summaries are only available for unencrypted boards",
        )));
    }
    if db::allowed(&access, Some(user), state.force_pro()).is_err() {
        return Err(Box::new(text(
            StatusCode::FORBIDDEN,
            "You cannot open this board",
        )));
    }
    let board = match db::load_board(&state.db, session_id).await {
        Ok(Some(board)) => board,
        Ok(None) => return Err(Box::new(text(StatusCode::NOT_FOUND, "Session not found"))),
        Err(error) => {
            tracing::warn!(%error, "summary board");
            return Err(Box::new(text(
                StatusCode::INTERNAL_SERVER_ERROR,
                "AI request failed",
            )));
        }
    };
    if board.options.blur_cards {
        return Err(Box::new(text(
            StatusCode::FORBIDDEN,
            "AI summaries are not available while cards are blurred",
        )));
    }
    Ok(board)
}

fn summary_prompt_for(state: &AppState, board: &Board) -> String {
    let show_authors = board.options.allow_author_visible && !state.config.disable_show_author;
    crate::ai::summary_prompt(board, show_authors)
}

async fn stored_summary(state: &AppState, board: &Board) -> StoredAiSummaryResponse {
    let stored = match db::stored_ai_summary(&state.db, &board.id).await {
        Ok(stored) => stored,
        Err(error) => {
            tracing::warn!(%error, "stored summary");
            return StoredAiSummaryResponse {
                summary: None,
                stale: false,
            };
        }
    };
    let current = crate::ai::summary_fingerprint(&summary_prompt_for(state, board));
    let (summary, fingerprint) = match stored {
        Some(row) => (row.summary, row.fingerprint),
        None => (None, None),
    };
    let stale = crate::ai::summary_is_stale(summary.as_deref(), fingerprint.as_deref(), &current);
    StoredAiSummaryResponse { summary, stale }
}

async fn logged_in_user(state: &AppState, session: &Mutex<Session>) -> Option<FullUser> {
    let (_, identity_id) = session.lock().await.user_ids()?;
    db::user_by_identity(&state.db, &identity_id, state.force_pro())
        .await
        .ok()
        .flatten()
}

async fn allowance_or_config(state: &AppState, user: &FullUser) -> Option<Response> {
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
        return Some(text(
            StatusCode::PAYMENT_REQUIRED,
            "You have reached your monthly allowance of messages",
        ));
    }
    if state.config.anthropic_api_key.is_empty() {
        return Some(text(
            StatusCode::INTERNAL_SERVER_ERROR,
            "AI is not configured",
        ));
    }
    None
}
