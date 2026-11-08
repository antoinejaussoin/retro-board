//! Coloured console log, in the same shape as the old chalk output.
//! Every line is flushed so `docker compose up` shows it immediately.

use std::io::{self, Write};

use serde::Serialize;
use serde_json::Value;

use crate::config::Config;

const RESET: &str = "\u{1b}[0m";

fn colours() -> bool {
    std::env::var_os("NO_COLOR").is_none()
}

fn paint(code: &str, text: &str) -> String {
    if colours() {
        format!("\u{1b}[{code}m{text}{RESET}")
    } else {
        text.to_owned()
    }
}

fn red(text: &str) -> String {
    paint("31", text)
}

fn green(text: &str) -> String {
    paint("32", text)
}

fn yellow(text: &str) -> String {
    paint("33", text)
}

fn blue(text: &str) -> String {
    paint("34", text)
}

fn cyan(text: &str) -> String {
    paint("36", text)
}

fn grey(text: &str) -> String {
    paint("90", text)
}

fn say(message: impl AsRef<str>) {
    let mut out = io::stdout().lock();
    let _ = writeln!(out, "{}", message.as_ref());
    let _ = out.flush();
}

fn err(message: impl AsRef<str>) {
    let mut out = io::stderr().lock();
    let _ = writeln!(out, "{}", message.as_ref());
    let _ = out.flush();
}

fn stamp() -> String {
    use chrono::{Datelike, Timelike};
    let now = chrono::Local::now();
    yellow(&format!(
        "[{}/{} {:02}:{:02}:{:02}] ",
        now.day(),
        now.month(),
        now.hour(),
        now.minute(),
        now.second()
    ))
}

fn short_event(event: &str) -> String {
    event
        .strip_prefix("retrospected/")
        .unwrap_or(event)
        .to_owned()
}

fn clip(body: &str) -> String {
    const LIMIT: usize = 2_000;
    if body.chars().count() <= LIMIT {
        return body.to_owned();
    }
    let mut clipped: String = body.chars().take(LIMIT).collect();
    clipped.push('…');
    clipped
}

fn has_key(value: &Value, key: &str) -> bool {
    match value {
        Value::Object(map) => {
            map.contains_key(key) || map.values().any(|child| has_key(child, key))
        }
        Value::Array(items) => items.iter().any(|child| has_key(child, key)),
        Value::Null | Value::Bool(_) | Value::Number(_) | Value::String(_) => false,
    }
}

fn warn_secrets(value: &Value) {
    if has_key(value, "password") {
        err(red(&format!(
            "The following object has a password property: {value}"
        )));
    }
}

/// Printed before the banner, matching the old process entrypoint.
pub fn sentry(enabled: bool) {
    let version = env!("CARGO_PKG_VERSION");
    if enabled {
        say(format!("{} {}", blue("Sentry is enabled"), yellow(version)));
    } else {
        say(format!(
            "{} {}",
            yellow("Sentry is disabled"),
            yellow(version)
        ));
    }
}

/// `SENTRY_URL` was set to something that is not a DSN.
pub fn sentry_ignored() {
    say(format!(
        "{} {}",
        red("Sentry is disabled"),
        red("because SENTRY_URL is not a DSN")
    ));
}

/// Startup banner: database, licence, Redis, mail, and OAuth.
pub fn banner(config: &Config, owner: Option<&str>, migrations_applied: usize) {
    say(format!("💻  {}", yellow("Using Postgres database")));
    if migrations_applied == 0 {
        say(yellow("Database schema is current"));
    } else {
        say(format!(
            "{} {migrations_applied} {}",
            yellow("Applied"),
            yellow("migrations")
        ));
    }
    match owner {
        Some(owner) => {
            say(green("-----------------------------------------------"));
            say(format!("👍  {}", green("This software is licenced.")));
            say(format!(
                "🔑  {}",
                green(&format!("This licence belongs to {owner}."))
            ));
            say(green("-----------------------------------------------"));
        }
        None => {
            say(red(
                "-------------------------------------------------------------",
            ));
            say(format!("⚠️  {}", red("This software is not licenced.")));
            say(red("   You can obtain a licence here:"));
            say(red(
                "   https://app.retrospected.com/subscribe?product=self-hosted",
            ));
            say(red(
                "-------------------------------------------------------------",
            ));
        }
    }
    if config.self_hosted {
        say(format!(
            "🤳  {}",
            cyan("This software is self-hosted. All users are Pro.")
        ));
    }
    if config.redis_enabled {
        say(format!(
            "💾  {} for {} was {}",
            red("Redis"),
            yellow("sessions"),
            blue("activated")
        ));
    }
    if config.redis_for_socketio {
        say(format!(
            "💾  {} for {} was {}",
            red("Redis"),
            yellow("Socket.IO"),
            blue("activated")
        ));
    }
    if config.anthropic_api_key.is_empty() {
        say(format!(
            "🤖  {} from {} was {}.",
            red("AI"),
            yellow("Anthropic"),
            red("not activated")
        ));
        say(format!(
            "    Please set the {} environment variable.",
            yellow("ANTHROPIC_API_KEY")
        ));
    } else {
        say(format!(
            "🤖  {} from {} has been {} (model {}).",
            red("AI"),
            yellow("Anthropic"),
            blue("activated"),
            yellow(&config.anthropic_model)
        ));
    }
    for (name, enabled) in [
        ("Twitter", !config.twitter_key.is_empty()),
        ("Google", !config.google_key.is_empty()),
        ("GitHub", !config.github_key.is_empty()),
        ("Slack", !config.slack_key.is_empty()),
        ("Microsoft", !config.microsoft_key.is_empty()),
        ("Okta", !config.okta_key.is_empty()),
    ] {
        if enabled {
            say(format!(
                "🔑  {} authentication {}",
                red(name),
                blue("activated")
            ));
        }
    }
    if !config.sendgrid_api_key.is_empty() {
        say(format!(
            "📨  {} is going to be used for {}",
            red("SendGrid"),
            yellow("emails")
        ));
    } else if !config.mail_smtp_host.is_empty() {
        say(format!(
            "📨  {} is going to be used for {}",
            red("SMTP"),
            yellow("emails")
        ));
    } else {
        say(format!(
            "📨  {} It is recommended to setup a SendGrid or SMTP email provider for account management.",
            red("NO EMAIL PROVIDER CONFIGURED.")
        ));
    }
}

/// Printed once the port is open.
pub fn listening(port: u16) {
    let environment = std::env::var("NODE_ENV").unwrap_or_else(|_| "dev".into());
    say(format!(
        "Server started on port {}, environment: {}",
        red(&port.to_string()),
        blue(&environment)
    ));
}

/// One line per HTTP response. Health checks and the socket transport are omitted.
pub fn http(method: &str, path: &str, status: u16) {
    if path == "/healthz" || path.starts_with("/socket.io") {
        return;
    }
    let status_text = status.to_string();
    let coloured = match status {
        200..=299 => green(&status_text),
        300..=399 => cyan(&status_text),
        400..=499 => yellow(&status_text),
        _ => red(&status_text),
    };
    say(format!("{}{} {} {}", stamp(), blue(method), path, coloured));
}

pub fn ws_connect(id: &str, ip: &str, who: &str) {
    say(format!(
        "{}{} {} {}",
        stamp(),
        blue("Connection:"),
        red("New user connected"),
        grey(&format!("{id} {ip} {who}"))
    ));
}

pub fn ws_disconnect(id: &str, ip: &str) {
    say(format!(
        "{}{} {} {}",
        stamp(),
        blue("Disconnection:"),
        red("User left"),
        grey(&format!("{id} {ip}"))
    ));
}

pub fn ws_limited(session_id: &str) {
    say(format!(
        "{}{}",
        stamp(),
        red(&format!(
            "Websocket has been rate limited for SID {session_id}"
        ))
    ));
}

pub fn ws_in(event: &str, data: &Value) {
    say(format!(
        "{}{} {} {}",
        stamp(),
        red("  <-- "),
        blue(&short_event(event)),
        grey(&clip(&data.to_string()))
    ));
    warn_secrets(data);
}

pub fn ws_out(event: &str, data: &impl Serialize, to_others: bool) {
    let body = serde_json::to_string(data).unwrap_or_else(|_| "{}".into());
    let arrow = if to_others {
        green("  ==> ")
    } else {
        green("  --> ")
    };
    say(format!(
        "{}{arrow} {} {}",
        stamp(),
        blue(&short_event(event)),
        grey(&clip(&body))
    ));
    if let Ok(value) = serde_json::to_value(data) {
        warn_secrets(&value);
    }
}

#[cfg(test)]
mod tests {
    use super::has_key;
    use serde_json::json;

    #[test]
    fn finds_a_nested_password_field() {
        assert!(has_key(
            &json!({"user": {"password": "secret"}}),
            "password"
        ));
        assert!(!has_key(&json!({"name": "Ada"}), "password"));
    }
}
