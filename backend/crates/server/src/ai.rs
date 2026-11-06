//! OpenAI coach chat.

use crate::models::CoachMessage;

pub const SYSTEM: &str = "You are an online agile coach, helping users to improve their online retrospectives, using Retrospected. Users are part of a remote team and are not physically in the same room. Always introduce yourself as an agile coach that can help users improve their online retrospectives and make the most out of Retrospected.";

pub async fn complete(api_key: &str, messages: &[CoachMessage]) -> Result<String, reqwest::Error> {
    let payload = serde_json::json!({
        "model": "gpt-4",
        "messages": messages.iter().map(|message| serde_json::json!({
            "role": message.role,
            "content": message.content.clone().unwrap_or_default()
        })).collect::<Vec<_>>()
    });
    let response = reqwest::Client::new()
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await?
        .error_for_status()?;
    let body: serde_json::Value = response.json().await?;
    Ok(body
        .pointer("/choices/0/message/content")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_owned())
}
