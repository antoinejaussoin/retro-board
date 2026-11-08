//! Verification and reset mail. Mailjet is preferred, SMTP is the fallback.

use crate::config::Config;

const REGISTER: &str = include_str!("../templates/register.template.html");
const RESET: &str = include_str!("../templates/reset-password.template.html");
const WELCOME: &str = include_str!("../templates/self-hosted.template.html");

pub async fn send_verification(config: &Config, email: &str, name: &str, code: &str) {
    let email_query = query_component(email);
    let body = fill(
        REGISTER,
        &[
            ("email", &email_query),
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
    let email_query = query_component(email);
    let body = fill(
        RESET,
        &[
            ("email", &email_query),
            ("name", name),
            ("code", code),
            ("domain", &config.base_url),
        ],
    );
    send(config, email, "Reset your Retrospected password", &body).await;
}

pub async fn send_welcome(config: &Config, email: &str, name: &str, key: &str) {
    let email_query = query_component(email);
    let body = fill(
        WELCOME,
        &[("email", &email_query), ("name", name), ("key", key)],
    );
    send(
        config,
        email,
        "Your Retrospected self-hosted licence",
        &body,
    )
    .await;
}

/// Percent-encode a query value. `+` must become `%2B`, because query parsers read `+` as a space.
fn query_component(value: &str) -> String {
    urlencoding::encode(value).into_owned()
}

fn fill(template: &str, values: &[(&str, &str)]) -> String {
    let mut body = template.to_owned();
    for (key, value) in values {
        body = body.replace(&format!("{{{{{key}}}}}"), value);
    }
    body
}

async fn send(config: &Config, to: &str, subject: &str, html: &str) {
    if config.mailjet_selected() {
        if let Err(error) = send_mailjet(config, to, subject, html).await {
            tracing::warn!(%error, "mailjet delivery failed");
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

/// Body for `POST https://api.mailjet.com/v3.1/send`.
fn mailjet_body(from: &str, to: &str, subject: &str, html: &str) -> serde_json::Value {
    serde_json::json!({
        "Messages": [{
            "From": { "Email": from, "Name": "Retrospected" },
            "To": [{ "Email": to }],
            "Subject": subject,
            "HTMLPart": html
        }]
    })
}

/// Why a Mailjet response did not deliver. `None` means the message was accepted.
fn mailjet_failure(status: u16, body: &str) -> Option<String> {
    if !(200..300).contains(&status) {
        let detail = serde_json::from_str::<serde_json::Value>(body)
            .ok()
            .map(|value| error_messages(&value).join("; "))
            .filter(|text| !text.is_empty())
            .unwrap_or_else(|| "request rejected".to_owned());
        return Some(format!("status {status}: {detail}"));
    }
    let Ok(value) = serde_json::from_str::<serde_json::Value>(body) else {
        return None;
    };
    let messages = value
        .get("Messages")
        .and_then(serde_json::Value::as_array)?;
    let mut failures = Vec::new();
    for message in messages {
        let state = message
            .get("Status")
            .and_then(serde_json::Value::as_str)
            .unwrap_or("");
        if state == "success" {
            continue;
        }
        let detail = error_messages(message);
        if detail.is_empty() {
            failures.push(format!("status {state}"));
        } else {
            failures.push(detail.join("; "));
        }
    }
    if failures.is_empty() {
        None
    } else {
        Some(failures.join("; "))
    }
}

fn error_messages(value: &serde_json::Value) -> Vec<String> {
    let mut messages = Vec::new();
    collect_error_messages(value, &mut messages);
    messages
}

fn collect_error_messages(value: &serde_json::Value, messages: &mut Vec<String>) {
    if let Some(message) = value
        .get("ErrorMessage")
        .and_then(serde_json::Value::as_str)
    {
        if !message.is_empty() {
            messages.push(message.to_owned());
        }
    }
    match value {
        serde_json::Value::Array(items) => {
            for item in items {
                collect_error_messages(item, messages);
            }
        }
        serde_json::Value::Object(map) => {
            for (key, item) in map {
                if key != "ErrorMessage" {
                    collect_error_messages(item, messages);
                }
            }
        }
        serde_json::Value::Null
        | serde_json::Value::Bool(_)
        | serde_json::Value::Number(_)
        | serde_json::Value::String(_) => {}
    }
}

async fn send_mailjet(config: &Config, to: &str, subject: &str, html: &str) -> Result<(), String> {
    if config.mailjet_secret_key.is_empty() {
        return Err("MAILJET_SECRET_KEY is empty".into());
    }
    if config.mailjet_sender.is_empty() {
        return Err("MAILJET_SENDER is empty".into());
    }
    let response = reqwest::Client::new()
        .post("https://api.mailjet.com/v3.1/send")
        .basic_auth(&config.mailjet_api_key, Some(&config.mailjet_secret_key))
        .json(&mailjet_body(&config.mailjet_sender, to, subject, html))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    let status = response.status().as_u16();
    let body = response.text().await.map_err(|error| error.to_string())?;
    match mailjet_failure(status, &body) {
        Some(error) => Err(error),
        None => Ok(()),
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
    use super::{fill, mailjet_body, mailjet_failure, query_component, send_smtp, REGISTER};
    use crate::config::Config;

    #[test]
    fn verification_link_encodes_a_plus_in_the_address() {
        let email = query_component("ant+mailjet@jaussoin.com");
        let body = fill(
            REGISTER,
            &[
                ("email", &email),
                ("name", "Ada"),
                ("code", "2f0be913-6776-4f05-bccc-6368a5f13c35"),
                ("domain", "https://app-beta.retrospected.com"),
            ],
        );
        assert!(body.contains(
            "email=ant%2Bmailjet%40jaussoin.com&code=2f0be913-6776-4f05-bccc-6368a5f13c35"
        ));
        assert!(!body.contains("email=ant+mailjet@jaussoin.com"));
    }

    #[test]
    fn mailjet_body_uses_the_v3_send_shape() {
        let body = mailjet_body(
            "coach@example.com",
            "ada@example.com",
            "Welcome",
            "<p>Hi</p>",
        );
        let message = &body["Messages"][0];
        assert_eq!(message["From"]["Email"], "coach@example.com");
        assert_eq!(message["From"]["Name"], "Retrospected");
        assert_eq!(message["To"][0]["Email"], "ada@example.com");
        assert_eq!(message["Subject"], "Welcome");
        assert_eq!(message["HTMLPart"], "<p>Hi</p>");
    }

    #[test]
    fn mailjet_failure_accepts_a_successful_message() {
        let body = r#"{"Messages":[{"Status":"success","To":[],"Cc":[],"Bcc":[]}]}"#;
        assert_eq!(mailjet_failure(200, body), None);
    }

    #[test]
    fn mailjet_failure_reports_a_rejected_message_and_an_auth_error() {
        let rejected = r#"{"Messages":[{"Status":"error","Errors":[{"ErrorMessage":"sender is not validated"}]}]}"#;
        assert_eq!(
            mailjet_failure(200, rejected).as_deref(),
            Some("sender is not validated")
        );
        let unauthorized = r#"{"ErrorMessage":"API key authentication/authorization failure"}"#;
        assert_eq!(
            mailjet_failure(401, unauthorized).as_deref(),
            Some("status 401: API key authentication/authorization failure")
        );
    }

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
