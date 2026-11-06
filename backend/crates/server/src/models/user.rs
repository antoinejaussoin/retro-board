use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, ts_rs::TS)]
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

pub fn user_ids(user_id: &str, identity_id: &str) -> String {
    format!("{user_id}:{identity_id}")
}

pub fn split_ids(value: &str) -> Option<(String, String)> {
    let (user, identity) = value.split_once(':')?;
    Some((user.to_owned(), identity.to_owned()))
}
