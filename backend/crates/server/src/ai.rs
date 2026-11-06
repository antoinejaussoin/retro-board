//! Anthropic Messages API for the agile coach.

use crate::models::CoachMessage;
use thiserror::Error;

/// Coach persona sent as the Anthropic `system` field.
pub const SYSTEM: &str = "You are an online agile coach, helping users to improve their online retrospectives, using Retrospected. Users are part of a remote team and are not physically in the same room. Always introduce yourself as an agile coach that can help users improve their online retrospectives and make the most out of Retrospected.";

/// Model used when `ANTHROPIC_MODEL` is unset.
pub const DEFAULT_MODEL: &str = "claude-sonnet-5-5";

const API_URL: &str = "https://api.anthropic.com/v1/messages";
const API_VERSION: &str = "2026-10-21";
const MAX_TOKENS: u32 = 4096;

/// Failure talking to Anthropic. The HTTP layer maps this to a generic 500.
#[derive(Debug, Error)]
pub enum AiError {
    /// The HTTP client could not complete the call.
    #[error("anthropic request failed")]
    Transport(#[from] reqwest::Error),
    /// Anthropic rejected the request. The body is omitted so prompts are not logged.
    #[error("anthropic returned status {status}")]
    Status {
        /// HTTP status code from the Messages API.
        status: u16,
    },
    /// The response contained no `text` blocks.
    #[error("anthropic response had no text")]
    Empty,
}

/// Send `messages` to Anthropic and return the concatenated text blocks.
///
/// # Errors
/// Returns [`AiError`] when the call fails, the status is not successful, or the body has no text.
pub async fn complete(
    api_key: &str,
    model: &str,
    messages: &[CoachMessage],
) -> Result<String, AiError> {
    let response = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()?
        .post(API_URL)
        .header("x-api-key", api_key)
        .header("anthropic-version", API_VERSION)
        .json(&request_body(model, messages))
        .send()
        .await?;
    let status = response.status();
    if !status.is_success() {
        return Err(AiError::Status {
            status: status.as_u16(),
        });
    }
    let body: serde_json::Value = response.json().await?;
    let text = text_from_response(&body);
    if text.is_empty() {
        Err(AiError::Empty)
    } else {
        Ok(text)
    }
}

/// Build the Messages API body. System turns are lifted out of `messages`.
fn request_body(model: &str, messages: &[CoachMessage]) -> serde_json::Value {
    let (system, turns) = conversation(messages);
    let mut body = serde_json::json!({
        "model": model,
        "max_tokens": MAX_TOKENS,
        "messages": turns,
    });
    if !system.is_empty() {
        body["system"] = serde_json::Value::String(system);
    }
    // Sonnet 5.5 thinks unless asked not to. `between_tools` keeps a tool-free
    // chat as plain text, so later turns do not need signed thinking blocks.
    if model == DEFAULT_MODEL {
        body["thinking"] = serde_json::json!({"type": "between_tools"});
        body["output_config"] = serde_json::json!({"effort": "medium"});
    }
    body
}

fn conversation(messages: &[CoachMessage]) -> (String, Vec<serde_json::Value>) {
    let mut system = Vec::new();
    let mut turns: Vec<(String, String)> = Vec::new();
    for message in messages {
        let Some(content) = message
            .content
            .as_deref()
            .map(str::trim)
            .filter(|text| !text.is_empty())
        else {
            continue;
        };
        if message.role == "system" {
            system.push(content.to_owned());
            continue;
        }
        let role = if message.role == "assistant" {
            "assistant"
        } else {
            "user"
        };
        if let Some((previous_role, previous)) = turns.last_mut() {
            if previous_role == role {
                previous.push('\n');
                previous.push_str(content);
                continue;
            }
        }
        turns.push((role.to_owned(), content.to_owned()));
    }
    while turns.first().is_some_and(|(role, _)| role != "user") {
        turns.remove(0);
    }
    let values = turns
        .into_iter()
        .map(|(role, content)| serde_json::json!({"role": role, "content": content}))
        .collect();
    (system.join("\n\n"), values)
}

fn text_from_response(body: &serde_json::Value) -> String {
    body.get("content")
        .and_then(serde_json::Value::as_array)
        .map(|blocks| {
            blocks
                .iter()
                .filter_map(text_block)
                .collect::<Vec<_>>()
                .join("")
        })
        .unwrap_or_default()
}

fn text_block(block: &serde_json::Value) -> Option<&str> {
    if block.get("type").and_then(serde_json::Value::as_str) == Some("text") {
        block.get("text").and_then(serde_json::Value::as_str)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::{conversation, request_body, text_from_response, DEFAULT_MODEL};
    use crate::models::CoachMessage;
    use serde_json::json;

    fn message(role: &str, content: Option<&str>) -> CoachMessage {
        CoachMessage {
            role: role.to_owned(),
            content: content.map(str::to_owned),
        }
    }

    #[test]
    fn system_turns_leave_the_message_list() {
        let body = request_body(
            DEFAULT_MODEL,
            &[
                message("system", Some("Be brief.")),
                message("user", Some("Hello")),
                message("assistant", Some("Hi")),
                message("user", Some("Thanks")),
            ],
        );
        assert_eq!(body["system"], "Be brief.");
        assert_eq!(body["model"], DEFAULT_MODEL);
        assert_eq!(body["thinking"]["type"], "between_tools");
        assert_eq!(body["output_config"]["effort"], "medium");
        assert_eq!(
            body["messages"],
            json!([
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi"},
                {"role": "user", "content": "Thanks"}
            ])
        );
    }

    #[test]
    fn other_models_omit_the_sonnet_thinking_override() {
        let body = request_body("claude-haiku-5-5", &[message("user", Some("Hello"))]);
        assert!(body.get("thinking").is_none());
        assert!(body.get("output_config").is_none());
    }

    #[test]
    fn empty_turns_are_dropped_and_same_roles_merge() {
        let (system, turns) = conversation(&[
            message("assistant", Some("starts wrong")),
            message("user", Some("One")),
            message("user", Some("")),
            message("user", None),
            message("user", Some("Two")),
            message("system", Some("Extra")),
        ]);
        assert_eq!(system, "Extra");
        assert_eq!(turns, vec![json!({"role": "user", "content": "One\nTwo"})]);
    }

    #[test]
    fn text_blocks_are_joined_and_thinking_blocks_are_skipped() {
        let text = text_from_response(&json!({
            "content": [
                {"type": "thinking", "thinking": ""},
                {"type": "text", "text": "Hello "},
                {"type": "text", "text": "there"}
            ]
        }));
        assert_eq!(text, "Hello there");
        assert_eq!(text_from_response(&json!({})), "");
    }
}
