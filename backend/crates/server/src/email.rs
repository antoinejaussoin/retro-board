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
    if let Err(error) = send_smtp(config, to, subject, html).await {
        tracing::warn!(%error, "smtp delivery failed");
    }
}

async fn send_smtp(config: &Config, to: &str, subject: &str, html: &str) -> Result<(), String> {
    use lettre::message::header::ContentType;
    use lettre::message::Mailbox;
    use lettre::transport::smtp::authentication::Credentials;
    use lettre::transport::smtp::client::{Tls, TlsParameters};
    use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};

    let from = config
        .mail_sender
        .parse()
        .map_err(|error| format!("sender address: {error}"))?;
    let recipient = to
        .parse()
        .map_err(|error| format!("recipient address: {error}"))?;
    let message = Message::builder()
        .from(Mailbox::new(Some("Retrospected".into()), from))
        .to(Mailbox::new(None, recipient))
        .subject(subject)
        .header(ContentType::TEXT_HTML)
        .body(html.to_owned())
        .map_err(|error| format!("message: {error}"))?;
    let tls = TlsParameters::builder(config.mail_smtp_host.clone())
        .dangerous_accept_invalid_certs(config.mail_allow_self_signed)
        .build()
        .map_err(|error| format!("tls: {error}"))?;
    let tls = if config.mail_secure {
        Tls::Wrapper(tls)
    } else {
        Tls::Required(tls)
    };
    let mut transport =
        AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(&config.mail_smtp_host)
            .port(config.mail_port)
            .tls(tls);
    if !config.mail_user.is_empty() {
        transport = transport.credentials(Credentials::new(
            config.mail_user.clone(),
            config.mail_password.clone(),
        ));
    }
    transport
        .build()
        .send(message)
        .await
        .map(|_| ())
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::send_smtp;
    use crate::config::Config;

    #[tokio::test]
    async fn smtp_reports_a_refused_connection() {
        let mut config = Config::from_env();
        config.mail_smtp_host = "127.0.0.1".into();
        config.mail_port = 1;
        config.mail_secure = false;
        config.mail_allow_self_signed = false;
        config.mail_sender = "noreply@example.com".into();
        config.mail_user.clear();
        let error = send_smtp(&config, "person@example.com", "Hello", "<p>Hi</p>")
            .await
            .expect_err("nothing is listening on port 1");
        assert!(!error.is_empty());
    }
}
