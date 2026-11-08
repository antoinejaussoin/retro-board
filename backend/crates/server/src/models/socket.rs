use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::board::{ColumnDefinition, ReactionExtract, SessionOptions, VoteExtract};
use super::user::User;

#[derive(Debug, Deserialize, ts_rs::TS)]
#[ts(rename = "WebsocketMessage")]
pub struct WsMessage<T> {
    pub payload: T,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub ack: String,
}

#[derive(Debug, Serialize, ts_rs::TS)]
#[ts(rename = "WsErrorPayload")]
pub struct WsError {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub details: Option<String>,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
#[ts(rename = "WsPostUpdatePayload")]
pub struct PostUpdate {
    pub post: PostDraft,
    #[serde(rename = "groupId")]
    pub group_id: Option<String>,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct PostDraft {
    pub id: String,
    pub content: String,
    pub action: Option<String>,
    pub giphy: Option<String>,
    pub column: i32,
    pub rank: String,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct IncomingPost {
    pub id: Option<String>,
    pub content: String,
    pub column: i32,
    pub action: Option<String>,
    pub giphy: Option<String>,
    pub rank: Option<String>,
    pub group: Option<IdOnly>,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct IdOnly {
    pub id: String,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct IncomingGroup {
    pub id: Option<String>,
    pub label: String,
    pub column: i32,
    pub rank: Option<String>,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
#[ts(rename = "WsGroupUpdatePayload")]
pub struct GroupUpdate {
    pub group: GroupDraft,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct GroupDraft {
    pub id: String,
    pub label: String,
    pub column: i32,
    pub rank: String,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
#[ts(rename = "WsLikeUpdatePayload")]
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

#[derive(Debug, Deserialize, Serialize, ts_rs::TS)]
#[ts(rename = "WsDeletePostPayload")]
pub struct DeletePostPayload {
    #[serde(rename = "postId")]
    pub post_id: String,
}

#[derive(Debug, Deserialize, Serialize, ts_rs::TS)]
#[ts(rename = "WsDeleteGroupPayload")]
pub struct DeleteGroupPayload {
    #[serde(rename = "groupId")]
    pub group_id: String,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsSaveSessionSettingsPayload")]
pub struct SettingsPayload {
    pub settings: SessionSettings,
    pub save_as_template: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
pub struct SessionSettings {
    #[ts(optional = nullable)]
    pub name: Option<String>,
    #[ts(optional)]
    pub moderator: Option<User>,
    #[ts(optional)]
    pub options: Option<SessionOptions>,
    #[ts(optional)]
    pub columns: Option<Vec<ColumnDefinition>>,
    #[ts(optional)]
    pub locked: Option<bool>,
    #[ts(optional = nullable)]
    pub timer: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, ts_rs::TS)]
pub struct ChatIn {
    pub id: Option<String>,
    pub content: String,
}

/// Broadcast when a vote is stored.
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsReceiveLikeUpdatePayload")]
pub struct ReceiveLikePayload {
    pub post_id: String,
    pub vote: VoteExtract,
}

/// Client request to toggle an emoji reaction on a post.
#[derive(Debug, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsReactPayload")]
pub struct ReactPayload {
    pub post_id: String,
    pub emoji: String,
}

/// Broadcast when a reaction is added or removed.
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsReceiveReactPayload")]
pub struct ReceiveReactPayload {
    pub post_id: String,
    pub reaction: ReactionExtract,
    pub change: String,
}

/// Broadcast when a participant clears their votes on a post.
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsReceiveCancelVotesPayload")]
pub struct ReceiveCancelVotesPayload {
    pub post_id: String,
    pub user_id: String,
}

/// Remaining or newly started timer, in seconds.
#[derive(Debug, Serialize, ts_rs::TS)]
#[ts(rename = "WsReceiveTimerStartPayload")]
pub struct TimerStartPayload {
    pub duration: f64,
}

/// Broadcast when a participant toggles ready.
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "WsUserReadyPayload")]
pub struct UserReadyPayload {
    pub user_id: String,
    pub ready: bool,
    pub name: String,
}
