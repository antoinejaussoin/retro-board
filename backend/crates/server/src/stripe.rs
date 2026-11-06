//! Stripe REST calls used by checkout, the billing portal, and customers.

use crate::config::Config;
use crate::db::Identity;
use crate::models::{CheckoutPayload, Product};

pub fn products() -> Vec<Product> {
    vec![
        Product {
            name: "Pro Team",
            plan: "team",
            gbp: 990,
            usd: 1290,
            eur: 1190,
            seats: Some(20),
            recurring: true,
            payments_urls: None,
        },
        Product {
            name: "Pro Unlimited",
            plan: "unlimited",
            gbp: 3995,
            usd: 4995,
            eur: 4995,
            seats: None,
            recurring: true,
            payments_urls: None,
        },
        Product {
            name: "Self-Hosted",
            plan: "self-hosted",
            gbp: 49900,
            usd: 59900,
            eur: 59900,
            seats: None,
            recurring: false,
            payments_urls: None,
        },
    ]
}

fn product_id(config: &Config, plan: &str) -> String {
    match plan {
        "team" => config.stripe_team_product.clone(),
        "unlimited" => config.stripe_unlimited_product.clone(),
        _ => config.stripe_self_hosted_product.clone(),
    }
}

fn amount(plan: &str, currency: &str, yearly: bool) -> i64 {
    let product = products().into_iter().find(|product| product.plan == plan);
    let Some(product) = product else {
        return 0;
    };
    let unit = match currency {
        "gbp" => product.gbp,
        "eur" => product.eur,
        _ => product.usd,
    };
    unit * if yearly { 11 } else { 1 }
}

pub async fn create_customer(
    config: &Config,
    identity: &Identity,
    locale: &str,
) -> Result<String, reqwest::Error> {
    let response = client(config)
        .post("https://api.stripe.com/v1/customers")
        .form(&[
            (
                "email",
                identity
                    .user_email
                    .clone()
                    .unwrap_or_else(|| identity.username.clone().unwrap_or_default()),
            ),
            ("name", identity.user_name.clone()),
            ("metadata[userId]", identity.user_id.clone()),
            ("preferred_locales[]", locale.to_owned()),
        ])
        .send()
        .await?
        .error_for_status()?;
    let body: serde_json::Value = response.json().await?;
    Ok(body
        .get("id")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_owned())
}

pub async fn checkout(
    config: &Config,
    customer: &str,
    user_id: &str,
    payload: &CheckoutPayload,
) -> Result<String, reqwest::Error> {
    let interval = if payload.yearly { "year" } else { "month" };
    let response = client(config)
        .post("https://api.stripe.com/v1/checkout/sessions")
        .form(&[
            ("payment_method_types[]", "card".to_owned()),
            ("client_reference_id", user_id.to_owned()),
            ("customer", customer.to_owned()),
            ("mode", "subscription".to_owned()),
            (
                "success_url",
                format!("{}/account?welcome", config.base_url),
            ),
            ("cancel_url", format!("{}/subscribe", config.base_url)),
            ("metadata[plan]", payload.plan.clone()),
            ("metadata[currency]", payload.currency.clone()),
            (
                "metadata[domain]",
                payload.domain.clone().unwrap_or_default(),
            ),
            ("metadata[locale]", payload.locale.clone()),
            ("line_items[0][quantity]", "1".into()),
            (
                "line_items[0][price_data][currency]",
                payload.currency.clone(),
            ),
            (
                "line_items[0][price_data][product]",
                product_id(config, &payload.plan),
            ),
            (
                "line_items[0][price_data][unit_amount]",
                amount(&payload.plan, &payload.currency, payload.yearly).to_string(),
            ),
            (
                "line_items[0][price_data][recurring][interval]",
                interval.into(),
            ),
            (
                "line_items[0][price_data][recurring][interval_count]",
                "1".into(),
            ),
        ])
        .send()
        .await?
        .error_for_status()?;
    let body: serde_json::Value = response.json().await?;
    Ok(body
        .get("id")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_owned())
}

pub async fn portal(config: &Config, customer: &str) -> Result<String, reqwest::Error> {
    let response = client(config)
        .post("https://api.stripe.com/v1/billing_portal/sessions")
        .form(&[
            ("customer", customer),
            ("return_url", &format!("{}/account", config.base_url)),
        ])
        .send()
        .await?
        .error_for_status()?;
    let body: serde_json::Value = response.json().await?;
    Ok(body
        .get("url")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_owned())
}

fn client(config: &Config) -> reqwest::Client {
    let mut headers = reqwest::header::HeaderMap::new();
    let value = format!("Bearer {}", config.stripe_secret);
    if let Ok(header) = reqwest::header::HeaderValue::from_str(&value) {
        headers.insert(reqwest::header::AUTHORIZATION, header);
    }
    reqwest::Client::builder()
        .default_headers(headers)
        .build()
        .unwrap_or_else(|_| reqwest::Client::new())
}
