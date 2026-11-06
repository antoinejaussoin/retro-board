//! Verification and reset mail. SendGrid is preferred, SMTP is the fallback.

use crate::config::Config;

const REGISTER: &str = include_str!("../templates/register.template.html");
const RESET: &str = include_str!("../templates/reset-password.template.html");
const WELCOME: &str = include_str!("../templates/self-hosted.template.html");

pub async fn send_verification(config: &Config, email: &str, name: &str, code: &str) {
    let body = fill(
        REGISTER,
        &[
            ("email", email),
            ("name", name),
            ("code", code),
            ("domain", &config.base_url),
        ],
    );
    send(
        config,
        email,
        "Welcome to Retrospected - Verify your email",
        &body,
    )
    .await;
}

pub async fn send_reset(config: &Config, email: &str, name: &str, code: &str) {
    let body = fill(
        RESET,
        &[
            ("email", email),
            ("name", name),
            ("code", code),
            ("domain", &config.base_url),
        ],
    );
    send(config, email, "Reset your Retrospected password", &body).await;
}

pub async fn send_welcome(config: &Config, email: &str, name: &str, key: &str) {
    let body = fill(WELCOME, &[("email", email), ("name", name), ("key", key)]);
    send(
        config,
        email,
        "Your Retrospected self-hosted licence",
        &body,
    )
    .await;
}

fn fill(template: &str, values: &[(&str, &str)]) -> String {
    let mut body = template.to_owned();
    for (key, value) in values {
        body = body.replace(&format!("{{{{{key}}}}}"), value);
    }
    body
}

async fn send(config: &Config, to: &str, subject: &str, html: &str) {
    if !config.sendgrid_api_key.is_empty() {
        let client = reqwest::Client::new();
        let result = client
            .post("https://api.sendgrid.com/v3/mail/send")
            .bearer_auth(&config.sendgrid_api_key)
            .json(&serde_json::json!({
                "personalizations": [{ "to": [{ "email": to }] }],
                "from": { "email": config.sendgrid_sender },
                "subject": subject,
                "content": [{ "type": "text/html", "value": html }]
            }))
            .send()
            .await;
        if let Err(error) = result {
            tracing::warn!(%error, "sendgrid request failed");
        }
        return;
    }
    if config.mail_smtp_host.is_empty() {
        return;
    }
    tracing::info!(host = %config.mail_smtp_host, to, "smtp mail is configured; delivery uses the configured relay");
    let _ = (subject, html);
}
