use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::user::User;
#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
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

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
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

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
pub struct VoteExtract {
    pub id: String,
    pub user_name: String,
    pub user_id: String,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
pub struct PostGroup {
    pub id: String,
    pub column: i32,
    pub label: String,
    pub posts: Vec<Post>,
    pub rank: String,
    pub user: User,
}

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
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

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: String,
    pub content: String,
    pub user: User,
    pub created: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename = "Session")]
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

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
pub struct Participant {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub photo: Option<String>,
    pub online: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
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
