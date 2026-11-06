use serde::{Deserialize, Serialize};
use serde_json::Value;

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
