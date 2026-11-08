//! Environment configuration. Names and defaults match the TypeScript server.

use std::collections::HashMap;
use std::env;
use std::sync::OnceLock;

/// Values from the nearest `.env`, loaded once at startup.
///
/// Process environment variables win, so Docker and tests keep the values they set.
static DOTENV: OnceLock<HashMap<String, String>> = OnceLock::new();

/// Read the closest `.env`, starting at the working directory and walking up.
///
/// Missing files are ignored. `cargo run` from `backend/` picks up `backend/.env`.
pub fn load_dotenv() {
    let _ = DOTENV.set(read_nearest_dotenv());
}

/// Runtime configuration loaded from the environment.
#[derive(Clone, Debug)]
#[allow(dead_code)]
pub struct Config {
    pub licence_key: String,
    pub self_hosted: bool,
    pub self_hosted_admin: String,
    pub self_hosted_admin_password: String,
    pub db_name: String,
    pub db_user: String,
    pub db_password: String,
    pub db_host: String,
    pub db_port: u16,
    pub redis_enabled: bool,
    pub redis_for_socketio: bool,
    pub redis_host: String,
    pub redis_port: u16,
    pub backend_port: u16,
    pub session_secret: String,
    pub sql_log: bool,
    /// Sentry DSN. Empty or `NO_SENTRY` leaves error reporting off.
    pub sentry_url: String,
    pub base_url: String,
    pub secure_cookies: bool,
    pub trusted_proxies: Vec<String>,
    pub disable_anonymous_login: bool,
    pub disable_password_login: bool,
    pub disable_password_registration: bool,
    pub twitter_key: String,
    pub twitter_secret: String,
    pub google_key: String,
    pub google_secret: String,
    pub github_key: String,
    pub github_secret: String,
    pub slack_key: String,
    pub slack_secret: String,
    pub slack_signing_secret: String,
    pub slack_bot_enable: bool,
    pub microsoft_key: String,
    pub microsoft_secret: String,
    pub microsoft_tenant: Option<String>,
    pub microsoft_authorization_url: Option<String>,
    pub microsoft_token_url: Option<String>,
    pub okta_audience: String,
    pub okta_key: String,
    pub okta_secret: String,
    pub mailjet_api_key: String,
    pub mailjet_secret_key: String,
    pub mailjet_sender: String,
    pub stripe_secret: String,
    pub stripe_webhook_secret: String,
    pub stripe_team_product: String,
    pub stripe_unlimited_product: String,
    pub stripe_self_hosted_product: String,
    pub stripe_self_hosted_url_gbp: String,
    pub stripe_self_hosted_url_eur: String,
    pub stripe_self_hosted_url_usd: String,
    pub rate_limit_window_ms: u64,
    pub rate_limit_max: u32,
    pub rate_limit_ws_points: u32,
    pub rate_limit_ws_duration: u64,
    pub ws_max_buffer_size: u64,
    pub mail_smtp_host: String,
    pub mail_port: u16,
    pub mail_secure: bool,
    pub mail_sender: String,
    pub mail_user: String,
    pub mail_password: String,
    pub mail_allow_self_signed: bool,
    pub ga4_secret: String,
    pub ga4_measurement_id: String,
    pub anthropic_api_key: String,
    pub anthropic_model: String,
    pub ai_free_limit: f64,
    pub ai_paid_limit: f64,
    pub disable_account_deletion: bool,
    pub disable_show_author: bool,
}

impl Config {
    /// Load configuration, applying the same defaults as `backend/src/config.ts`.
    pub fn from_env() -> Self {
        Self {
            licence_key: env_str("LICENCE_KEY", ""),
            self_hosted: env_bool("SELF_HOSTED", true),
            self_hosted_admin: env_str("SELF_HOSTED_ADMIN", "admin@acme.com"),
            self_hosted_admin_password: env_str("SELF_HOSTED_ADMIN_PASSWORD", ""),
            db_name: env_str("DB_NAME", "retroboard"),
            db_user: env_str("DB_USER", "postgres"),
            db_password: env_str("DB_PASSWORD", "postgres"),
            db_host: env_str("DB_HOST", "postgres"),
            db_port: env_u16("DB_PORT", 5432),
            redis_enabled: env_bool("REDIS_ENABLED", true),
            redis_for_socketio: env_bool("REDIS_FOR_SOCKETIO_ENABLED", false),
            redis_host: env_str("REDIS_HOST", "redis"),
            redis_port: env_u16("REDIS_PORT", 6379),
            backend_port: env_u16("BACKEND_PORT", 3201),
            session_secret: env_str("SESSION_SECRET", "changeme"),
            sql_log: env_bool("SQL_LOG", false),
            sentry_url: env_str("SENTRY_URL", ""),
            base_url: env_str("BASE_URL", "http://localhost:80"),
            secure_cookies: env_bool("SECURE_COOKIES", false),
            trusted_proxies: env_list("TRUSTED_PROXIES"),
            disable_anonymous_login: env_bool("DISABLE_ANONYMOUS_LOGIN", false),
            disable_password_login: env_bool("DISABLE_PASSWORD_LOGIN", false),
            disable_password_registration: env_bool("DISABLE_PASSWORD_REGISTRATION", false),
            twitter_key: env_str("TWITTER_KEY", ""),
            twitter_secret: env_str("TWITTER_SECRET", ""),
            google_key: env_str("GOOGLE_KEY", ""),
            google_secret: env_str("GOOGLE_SECRET", ""),
            github_key: env_str("GITHUB_KEY", ""),
            github_secret: env_str("GITHUB_SECRET", ""),
            slack_key: env_str("SLACK_KEY", ""),
            slack_secret: env_str("SLACK_SECRET", ""),
            slack_signing_secret: env_str("SLACK_SIGNING_SECRET", ""),
            slack_bot_enable: env_bool("SLACK_BOT_ENABLE", false),
            microsoft_key: env_str("MICROSOFT_KEY", ""),
            microsoft_secret: env_str("MICROSOFT_SECRET", ""),
            microsoft_tenant: env_opt("MICROSOFT_TENANT"),
            microsoft_authorization_url: env_opt("MICROSOFT_AUTHORIZATION_URL"),
            microsoft_token_url: env_opt("MICROSOFT_TOKEN_URL"),
            okta_audience: env_str("OKTA_AUDIENCE", ""),
            okta_key: env_str("OKTA_KEY", ""),
            okta_secret: env_str("OKTA_SECRET", ""),
            mailjet_api_key: env_str("MAILJET_API_KEY", ""),
            mailjet_secret_key: env_str("MAILJET_SECRET_KEY", ""),
            mailjet_sender: env_str("MAILJET_SENDER", ""),
            stripe_secret: env_str("STRIPE_SECRET", ""),
            stripe_webhook_secret: env_str("STRIPE_WEBHOOK_SECRET", ""),
            stripe_team_product: env_str("STRIPE_TEAM_PRODUCT", ""),
            stripe_unlimited_product: env_str("STRIPE_UNLIMITED_PRODUCT", ""),
            stripe_self_hosted_product: env_str("STRIPE_SELF_HOSTED_PRODUCT", ""),
            stripe_self_hosted_url_gbp: env_str("STRIPE_SELF_HOSTED_URL_GBP", ""),
            stripe_self_hosted_url_eur: env_str("STRIPE_SELF_HOSTED_URL_EUR", ""),
            stripe_self_hosted_url_usd: env_str("STRIPE_SELF_HOSTED_URL_USD", ""),
            rate_limit_window_ms: env_u64("RATE_LIMIT_WINDOW", 900_000),
            rate_limit_max: env_u32("RATE_LIMIT_MAX", 500),
            rate_limit_ws_points: env_u32("RATE_LIMIT_WS_POINTS", 600),
            rate_limit_ws_duration: env_u64("RATE_LIMIT_WS_DURATION", 60),
            ws_max_buffer_size: env_u64("WS_MAX_BUFFER_SIZE", 10_000),
            mail_smtp_host: env_str("MAIL_SMTP_HOST", ""),
            mail_port: env_u16("MAIL_PORT", 465),
            mail_secure: env_bool("MAIL_SECURE", true),
            mail_sender: env_str("MAIL_SENDER", ""),
            mail_user: env_str("MAIL_USER", ""),
            mail_password: env_str("MAIL_PASSWORD", ""),
            mail_allow_self_signed: env_bool("MAIL_ALLOW_SELF_SIGNED_CERTS", false),
            ga4_secret: env_str("GA4_SECRET", ""),
            ga4_measurement_id: env_str("GA4_MEASUREMENT_ID", ""),
            anthropic_api_key: env_str("ANTHROPIC_API_KEY", ""),
            anthropic_model: env_model("ANTHROPIC_MODEL", crate::ai::DEFAULT_MODEL),
            ai_free_limit: env_f64_fallback("AI_FREE_LIMIT", "OPEN_AI_FREE_LIMIT", 5.0),
            ai_paid_limit: env_f64_fallback("AI_PAID_LIMIT", "OPEN_AI_PAID_LIMIT", 1000.0),
            disable_account_deletion: env_bool("DISABLE_ACCOUNT_DELETION", false),
            disable_show_author: env_bool("DISABLE_SHOW_AUTHOR", false),
        }
    }

    /// Cookie signing secret, including the version suffix that forces re-auth.
    #[must_use]
    pub fn cookie_secret(&self) -> String {
        format!("{}-4.11.5", self.session_secret)
    }

    /// Hosted HTTPS always marks the session cookie `Secure`.
    #[must_use]
    pub fn secure_cookie(&self) -> bool {
        if !self.self_hosted && self.base_url.starts_with("https://") {
            true
        } else {
            self.secure_cookies
        }
    }

    /// Why a hosted process must refuse to bind. Self-hosted returns nothing.
    #[must_use]
    pub fn hosted_startup_error(&self) -> Option<&'static str> {
        hosted_startup_error(
            self.self_hosted,
            &self.session_secret,
            &self.stripe_secret,
            &self.stripe_webhook_secret,
        )
    }

    /// Defaults a self-hosted operator should change, without stopping the process.
    #[must_use]
    pub fn startup_warnings(&self) -> Vec<&'static str> {
        if !self.self_hosted {
            return Vec::new();
        }
        let mut warnings = Vec::new();
        if self.session_secret.is_empty() || self.session_secret == "changeme" {
            warnings.push("SESSION_SECRET is still the default; set a unique value");
        }
        if !self.stripe_secret.is_empty() && self.stripe_webhook_secret.is_empty() {
            warnings.push("STRIPE_WEBHOOK_SECRET is empty while STRIPE_SECRET is set");
        }
        warnings
    }

    #[must_use]
    pub fn database_url(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            urlencoding::encode(&self.db_user),
            urlencoding::encode(&self.db_password),
            self.db_host,
            self.db_port,
            self.db_name
        )
    }

    #[must_use]
    pub fn redis_url(&self) -> String {
        format!("redis://{}:{}", self.redis_host, self.redis_port)
    }

    /// Mailjet is selected when its API key is set. Secret and sender are still required to deliver.
    #[must_use]
    pub fn mailjet_selected(&self) -> bool {
        !self.mailjet_api_key.is_empty()
    }

    /// True when Mailjet has the API key, secret key, and sender address it needs.
    #[must_use]
    pub fn mailjet_ready(&self) -> bool {
        self.mailjet_selected()
            && !self.mailjet_secret_key.is_empty()
            && !self.mailjet_sender.is_empty()
    }

    #[must_use]
    pub fn emails_enabled(&self) -> bool {
        !self.mail_smtp_host.is_empty() || self.mailjet_selected()
    }
}

/// Hosted deployments refuse a default session secret and an unsigned Stripe webhook.
#[must_use]
pub fn hosted_startup_error(
    self_hosted: bool,
    session_secret: &str,
    stripe_secret: &str,
    webhook_secret: &str,
) -> Option<&'static str> {
    if self_hosted {
        return None;
    }
    if session_secret.is_empty() || session_secret == "changeme" {
        return Some("SESSION_SECRET must be set to a unique value");
    }
    if !stripe_secret.is_empty() && webhook_secret.is_empty() {
        return Some("STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET is set");
    }
    None
}

fn env_raw(key: &str) -> Option<String> {
    match env::var(key) {
        Ok(value) => Some(value),
        Err(_) => DOTENV.get().and_then(|values| values.get(key).cloned()),
    }
}

fn env_str(key: &str, default: &str) -> String {
    env_raw(key).unwrap_or_else(|| default.to_owned())
}

fn env_list(key: &str) -> Vec<String> {
    env_str(key, "")
        .split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
        .collect()
}

fn env_opt(key: &str) -> Option<String> {
    env_raw(key).filter(|value| !value.is_empty())
}

fn env_bool(key: &str, default: bool) -> bool {
    match env_raw(key) {
        Some(value) => value == "true",
        None => default,
    }
}

fn env_u16(key: &str, default: u16) -> u16 {
    env_raw(key)
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_u32(key: &str, default: u32) -> u32 {
    env_raw(key)
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_u64(key: &str, default: u64) -> u64 {
    env_raw(key)
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_model(key: &str, default: &str) -> String {
    match env_raw(key) {
        Some(value) if !value.is_empty() => value,
        _ => default.to_owned(),
    }
}

fn env_f64_fallback(primary: &str, legacy: &str, default: f64) -> f64 {
    env_raw(primary)
        .and_then(|value| value.parse().ok())
        .or_else(|| env_raw(legacy).and_then(|value| value.parse().ok()))
        .unwrap_or(default)
}

fn read_nearest_dotenv() -> HashMap<String, String> {
    let Ok(mut dir) = env::current_dir() else {
        return HashMap::new();
    };
    loop {
        let path = dir.join(".env");
        if path.is_file() {
            return std::fs::read_to_string(&path)
                .map(|contents| parse_dotenv(&contents))
                .unwrap_or_default();
        }
        if !dir.pop() {
            return HashMap::new();
        }
    }
}

/// Parse `KEY=value` lines. Later duplicates replace earlier ones.
fn parse_dotenv(contents: &str) -> HashMap<String, String> {
    let mut values = HashMap::new();
    for line in contents.lines() {
        let Some((key, value)) = parse_dotenv_line(line) else {
            continue;
        };
        values.insert(key, value);
    }
    values
}

fn parse_dotenv_line(line: &str) -> Option<(String, String)> {
    let line = line.trim().strip_prefix('\u{feff}').unwrap_or(line.trim());
    if line.is_empty() || line.starts_with('#') {
        return None;
    }
    let line = line.strip_prefix("export ").unwrap_or(line);
    let (key, value) = line.split_once('=')?;
    let key = key.trim();
    if key.is_empty() || key.contains(char::is_whitespace) {
        return None;
    }
    Some((key.to_owned(), unquote(value.trim())))
}

fn unquote(value: &str) -> String {
    let mut chars = value.chars();
    let Some(open) = chars.next() else {
        return String::new();
    };
    let Some(close) = chars.next_back() else {
        return value.to_owned();
    };
    if (open == '"' || open == '\'') && open == close {
        return value[open.len_utf8()..value.len() - close.len_utf8()].to_owned();
    }
    value.to_owned()
}

#[cfg(test)]
mod tests {
    use super::{hosted_startup_error, parse_dotenv};

    #[test]
    fn parse_dotenv_keeps_assignments_and_skips_comments() {
        let values = parse_dotenv(
            "\n# comment\nDB_HOST=localhost\nexport DB_PORT=5432\nDB_PASSWORD=\"postgres\"\n\n",
        );
        assert_eq!(values.get("DB_HOST").map(String::as_str), Some("localhost"));
        assert_eq!(values.get("DB_PORT").map(String::as_str), Some("5432"));
        assert_eq!(
            values.get("DB_PASSWORD").map(String::as_str),
            Some("postgres")
        );
        assert!(!values.contains_key("# comment"));
    }

    #[test]
    fn hosted_startup_rejects_the_default_secret_and_an_empty_webhook_secret() {
        assert_eq!(
            hosted_startup_error(false, "changeme", "", ""),
            Some("SESSION_SECRET must be set to a unique value")
        );
        assert_eq!(
            hosted_startup_error(false, "real-secret", "sk_live", ""),
            Some("STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET is set")
        );
        assert_eq!(hosted_startup_error(true, "changeme", "sk_live", ""), None);
        assert_eq!(
            hosted_startup_error(false, "real-secret", "sk_live", "whsec"),
            None
        );
    }
}
