use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::board::{ColumnDefinition, SessionOptions};
use super::user::User;
#[derive(Debug, Deserialize)]
pub struct WsMessage<T> {
    pub payload: T,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub ack: String,
}

#[derive(Debug, Serialize)]
pub struct WsError {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub details: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PostUpdate {
    pub post: PostDraft,
    #[serde(rename = "groupId")]
    pub group_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PostDraft {
    pub id: String,
    pub content: String,
    pub action: Option<String>,
    pub giphy: Option<String>,
    pub column: i32,
    pub rank: String,
}

#[derive(Debug, Deserialize)]
pub struct IncomingPost {
    pub id: Option<String>,
    pub content: String,
    pub column: i32,
    pub action: Option<String>,
    pub giphy: Option<String>,
    pub rank: Option<String>,
    pub group: Option<IdOnly>,
}

#[derive(Debug, Deserialize)]
pub struct IdOnly {
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct IncomingGroup {
    pub id: Option<String>,
    pub label: String,
    pub column: i32,
    pub rank: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct GroupUpdate {
    pub group: GroupDraft,
}

#[derive(Debug, Deserialize)]
pub struct GroupDraft {
    pub id: String,
    pub label: String,
    pub column: i32,
    pub rank: String,
}

#[derive(Debug, Deserialize)]
pub struct LikePayload {
    #[serde(rename = "type")]
    pub kind: String,
    #[serde(rename = "postId")]
    pub post_id: String,
}

#[derive(Debug, Deserialize)]
pub struct IdPayload {
    #[serde(rename = "postId", alias = "groupId")]
    pub id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DeletePostPayload {
    #[serde(rename = "postId")]
    pub post_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DeleteGroupPayload {
    #[serde(rename = "groupId")]
    pub group_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsPayload {
    pub settings: SessionSettings,
    pub save_as_template: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SessionSettings {
    pub name: Option<String>,
    pub moderator: Option<User>,
    pub options: Option<SessionOptions>,
    pub columns: Option<Vec<ColumnDefinition>>,
    pub locked: Option<bool>,
    pub timer: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct ChatIn {
    pub id: Option<String>,
    pub content: String,
}
