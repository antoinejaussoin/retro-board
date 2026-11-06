use serde::{Deserialize, Serialize};

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
