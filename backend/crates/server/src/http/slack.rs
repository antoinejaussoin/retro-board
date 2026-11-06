use axum::body::Bytes;
use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use serde::Deserialize;
use serde_json::json;

use crate::db::{self};
use crate::state::AppState;

#[derive(Deserialize)]
struct SlackForm {
    user_id: String,
    text: String,
    response_url: String,
}

pub(super) async fn slack_create(
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
