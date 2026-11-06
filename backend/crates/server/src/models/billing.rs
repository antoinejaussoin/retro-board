use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct AiChatPayload {
    pub id: String,
    pub messages: Vec<CoachMessage>,
}

/// Body of `POST /api/ai/summary`. Only the board id is accepted.
#[derive(Debug, Deserialize)]
pub struct AiSummaryPayload {
    pub id: String,
}

/// Body of `PATCH /api/ai/summary/{id}`. The Markdown the user edited.
#[derive(Debug, Deserialize)]
pub struct EditAiSummaryPayload {
    pub summary: String,
}

/// Markdown write-up returned by `POST /api/ai/summary`.
#[derive(Debug, Serialize)]
pub struct AiSummaryResponse {
    pub summary: String,
}

/// Saved write-up returned by `GET /api/ai/summary/{id}`.
#[derive(Debug, Serialize)]
pub struct StoredAiSummaryResponse {
    pub summary: Option<String>,
    /// True when the board has changed since `summary` was written.
    pub stale: bool,
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
