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

/// Instructions for a retrospective write-up. The board text is a separate user turn.
pub const SUMMARY_SYSTEM: &str = "You write a short retrospective summary in Markdown for a remote team using Retrospected. Cover the themes, what went well, what to improve, and the actions already recorded. Use only the board text you are given. Do not invent posts, people, or actions.";

/// Render an unencrypted board as the user prompt for [`SUMMARY_SYSTEM`].
///
/// Author names are included only when `show_authors` is true. Emails, chat
/// messages, and Giphy ids are never included.
#[must_use]
pub fn summary_prompt(board: &crate::models::Board, show_authors: bool) -> String {
    let title = board
        .name
        .as_deref()
        .filter(|name| !name.is_empty())
        .unwrap_or("Untitled retrospective");
    let mut lines = vec![format!("# {title}")];
    let mut columns = board.columns.clone();
    columns.sort_by_key(|column| column.index);
    for column in columns {
        lines.push(format!("\n## {}", column.label));
        let mut posts: Vec<_> = board
            .posts
            .iter()
            .filter(|post| post.column == column.index)
            .collect();
        posts.sort_by_key(|post| std::cmp::Reverse(vote_score(post)));
        if posts.is_empty() {
            lines.push("(no posts)".to_owned());
            continue;
        }
        for post in posts {
            lines.push(format_post(post, show_authors));
        }
    }
    let actions: Vec<_> = board
        .posts
        .iter()
        .filter_map(|post| post.action.as_deref().filter(|action| !action.is_empty()))
        .collect();
    if !actions.is_empty() {
        lines.push("\n## Actions".to_owned());
        for action in actions {
            lines.push(format!("- {action}"));
        }
    }
    lines.join("\n")
}

fn format_post(post: &crate::models::Post, show_authors: bool) -> String {
    let content = post.content.replace('\n', "\n  ");
    let mut line = format!(
        "- (+{}/-{}) {content}",
        vote_count(post, "like"),
        vote_count(post, "dislike")
    );
    if show_authors {
        line.push_str(&format!("\n  by {}", post.user.name));
    }
    if let Some(group) = &post.group {
        line.push_str(&format!("\n  group: {}", group.label));
    }
    line
}

fn vote_count(post: &crate::models::Post, kind: &str) -> usize {
    post.votes.iter().filter(|vote| vote.kind == kind).count()
}

fn vote_score(post: &crate::models::Post) -> i32 {
    let likes = i32::try_from(vote_count(post, "like")).unwrap_or(i32::MAX);
    let dislikes = i32::try_from(vote_count(post, "dislike")).unwrap_or(i32::MAX);
    likes.saturating_sub(dislikes)
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
    use super::{conversation, request_body, summary_prompt, text_from_response, DEFAULT_MODEL};
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
    fn summary_prompt_keeps_private_fields_out_and_honours_authors() {
        use crate::models::{
            Board, ColumnDefinition, Message, Post, PostGroup, SessionOptions, User, VoteExtract,
        };
        use chrono::TimeZone;

        let author = User {
            id: "u".into(),
            name: "Ada".into(),
            photo: None,
            email: Some("ada@example.com".into()),
        };
        let post = Post {
            id: "p".into(),
            column: 0,
            content: "Shipping felt calm".into(),
            action: Some("Keep the release checklist".into()),
            giphy: Some("gif-secret".into()),
            user: author.clone(),
            group: Some(PostGroup {
                id: "g".into(),
                column: 0,
                label: "Delivery".into(),
                posts: Vec::new(),
                rank: "0".into(),
                user: author.clone(),
            }),
            rank: "0".into(),
            votes: vec![
                VoteExtract {
                    id: "v1".into(),
                    user_name: "Ada".into(),
                    user_id: "u".into(),
                    kind: "like".into(),
                },
                VoteExtract {
                    id: "v2".into(),
                    user_name: "Grace".into(),
                    user_id: "g".into(),
                    kind: "dislike".into(),
                },
            ],
        };
        let board = Board {
            id: "s".into(),
            name: Some("Sprint 12".into()),
            columns: vec![ColumnDefinition {
                id: "c".into(),
                kind: "well".into(),
                index: 0,
                label: "Went well".into(),
                color: "#fff".into(),
                icon: None,
            }],
            created_by: author.clone(),
            moderator: author.clone(),
            groups: vec![],
            posts: vec![post],
            messages: vec![Message {
                id: "m".into(),
                content: "secret chat".into(),
                user: author,
                created: chrono::Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap(),
            }],
            options: SessionOptions {
                allow_author_visible: true,
                ..SessionOptions::default()
            },
            encrypted: None,
            locked: false,
            ready: vec![],
            timer: None,
            demo: false,
        };

        let named = summary_prompt(&board, true);
        assert!(named.contains("Sprint 12"), "{named}");
        assert!(named.contains("Went well"), "{named}");
        assert!(named.contains("(+1/-1) Shipping felt calm"), "{named}");
        assert!(named.contains("by Ada"), "{named}");
        assert!(named.contains("group: Delivery"), "{named}");
        assert!(named.contains("Keep the release checklist"), "{named}");
        assert!(!named.contains("ada@example.com"), "{named}");
        assert!(!named.contains("secret chat"), "{named}");
        assert!(!named.contains("gif-secret"), "{named}");

        let anonymous = summary_prompt(&board, false);
        assert!(!anonymous.contains("by Ada"), "{anonymous}");
        assert!(anonymous.contains("Shipping felt calm"), "{anonymous}");
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
