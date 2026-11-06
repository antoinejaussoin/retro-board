//! JSON shapes shared with the frontend.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub name: String,
    pub photo: Option<String>,
    pub email: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullUser {
    pub id: String,
    pub identity_id: String,
    pub name: String,
    pub photo: Option<String>,
    pub email: Option<String>,
    pub can_delete_session: bool,
    pub pro: bool,
    pub account_type: String,
    pub language: Option<String>,
    pub username: Option<String>,
    pub stripe_id: Option<String>,
    pub currency: Option<String>,
    pub plan: Option<String>,
    pub plan_owner: Option<String>,
    pub plan_owner_email: Option<String>,
    pub plan_admins: Option<Vec<String>>,
    pub plan_members: Option<Vec<String>>,
    pub domain: Option<String>,
    pub own_plan: Option<String>,
    pub own_subscriptions_id: Option<String>,
    pub trial: Option<DateTime<Utc>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionOptions {
    pub max_up_votes: Option<f64>,
    pub max_down_votes: Option<f64>,
    pub max_posts: Option<f64>,
    pub allow_actions: bool,
    pub allow_self_voting: bool,
    pub allow_multiple_votes: bool,
    pub allow_author_visible: bool,
    pub allow_giphy: bool,
    pub allow_grouping: bool,
    pub allow_reordering: bool,
    pub allow_cancel_vote: bool,
    pub restrict_title_edit_to_moderator: bool,
    pub restrict_reordering_to_moderator: bool,
    pub restrict_grouping_to_moderator: bool,
    pub blur_cards: bool,
    pub new_posts_first: bool,
    pub allow_timer: bool,
    pub timer_duration: f64,
    pub readonly_on_timer_end: bool,
}

impl Default for SessionOptions {
    fn default() -> Self {
        Self {
            max_up_votes: None,
            max_down_votes: None,
            max_posts: None,
            allow_actions: true,
            allow_self_voting: false,
            allow_multiple_votes: false,
            allow_author_visible: false,
            allow_giphy: true,
            allow_grouping: true,
            allow_reordering: true,
            allow_cancel_vote: true,
            restrict_title_edit_to_moderator: false,
            restrict_reordering_to_moderator: false,
            restrict_grouping_to_moderator: false,
            blur_cards: false,
            new_posts_first: true,
            allow_timer: true,
            timer_duration: 900.0,
            readonly_on_timer_end: true,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColumnDefinition {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub index: i32,
    pub label: String,
    pub color: String,
    pub icon: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VoteExtract {
    pub id: String,
    pub user_name: String,
    pub user_id: String,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostGroup {
    pub id: String,
    pub column: i32,
    pub label: String,
    pub posts: Vec<Post>,
    pub rank: String,
    pub user: User,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    pub id: String,
    pub column: i32,
    pub content: String,
    pub action: Option<String>,
    pub giphy: Option<String>,
    pub user: User,
    pub group: Option<PostGroup>,
    pub rank: String,
    pub votes: Vec<VoteExtract>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: String,
    pub content: String,
    pub user: User,
    pub created: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: String,
    pub name: Option<String>,
    pub columns: Vec<ColumnDefinition>,
    pub created_by: User,
    pub moderator: User,
    pub groups: Vec<PostGroup>,
    pub posts: Vec<Post>,
    pub messages: Vec<Message>,
    pub options: SessionOptions,
    pub encrypted: Option<String>,
    pub locked: bool,
    pub ready: Vec<String>,
    pub timer: Option<DateTime<Utc>>,
    pub demo: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Participant {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub photo: Option<String>,
    pub online: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionMetadata {
    pub id: String,
    pub name: Option<String>,
    pub participants: Vec<User>,
    pub number_of_posts: i64,
    pub number_of_votes: i64,
    pub number_of_actions: i64,
    pub created: DateTime<Utc>,
    pub created_by: User,
    pub can_be_deleted: bool,
    pub encrypted: Option<String>,
    pub locked: bool,
    pub locked_for_user: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterPayload {
    pub name: String,
    pub username: String,
    pub password: String,
    pub language: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct ValidatePayload {
    pub email: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPayload {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordPayload {
    pub email: String,
    pub password: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSessionPayload {
    pub encrypted_check: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChangeNamePayload {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct LanguagePayload {
    pub language: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteAccountPayload {
    pub delete_sessions: bool,
    pub delete_posts: bool,
    pub delete_votes: bool,
}

#[derive(Debug, Deserialize)]
pub struct LicencePayload {
    pub key: String,
}

#[derive(Debug, Deserialize)]
pub struct AdminPasswordPayload {
    #[serde(rename = "userId")]
    pub user_id: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct MergePayload {
    pub main: String,
    pub merged: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackendCapabilities {
    pub self_hosted: bool,
    pub email_available: bool,
    pub admin_email: String,
    pub licenced: bool,
    pub o_auth: OAuthFlags,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slack_client_id: Option<String>,
    pub disable_anonymous: bool,
    pub disable_passwords: bool,
    pub disable_password_registration: bool,
    pub disable_account_deletion: bool,
    pub disable_show_author: bool,
    pub ai: bool,
}

#[derive(Debug, Serialize)]
pub struct OAuthFlags {
    pub google: bool,
    pub twitter: bool,
    pub slack: bool,
    pub microsoft: bool,
    pub github: bool,
    pub okta: bool,
}

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

#[derive(Debug, Deserialize)]
pub struct AiChatPayload {
    pub id: String,
    pub messages: Vec<CoachMessage>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CoachMessage {
    pub role: String,
    pub content: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckoutPayload {
    pub plan: String,
    pub currency: String,
    pub locale: String,
    pub domain: Option<String>,
    pub yearly: bool,
}

#[derive(Debug, Serialize)]
pub struct Product {
    pub name: &'static str,
    pub plan: &'static str,
    pub gbp: i64,
    pub usd: i64,
    pub eur: i64,
    pub seats: Option<i64>,
    pub recurring: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payments_urls: Option<Value>,
}

pub fn user_ids(user_id: &str, identity_id: &str) -> String {
    format!("{user_id}:{identity_id}")
}

pub fn split_ids(value: &str) -> Option<(String, String)> {
    let (user, identity) = value.split_once(':')?;
    Some((user.to_owned(), identity.to_owned()))
}
