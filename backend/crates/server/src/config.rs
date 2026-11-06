//! Environment configuration. Names and defaults match the TypeScript server.

use std::env;

/// Runtime configuration loaded from the environment.
#[derive(Clone, Debug)]
#[allow(dead_code)]
pub struct Config {
    pub licence_key: String,
    pub self_hosted: bool,
    pub self_hosted_admin: String,
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
    pub base_url: String,
    pub secure_cookies: bool,
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
    pub slack_bot_enable: bool,
    pub microsoft_key: String,
    pub microsoft_secret: String,
    pub microsoft_tenant: Option<String>,
    pub microsoft_authorization_url: Option<String>,
    pub microsoft_token_url: Option<String>,
    pub okta_audience: String,
    pub okta_key: String,
    pub okta_secret: String,
    pub sendgrid_api_key: String,
    pub sendgrid_sender: String,
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
    pub open_ai_api_key: String,
    pub open_ai_free_limit: f64,
    pub open_ai_paid_limit: f64,
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
            base_url: env_str("BASE_URL", "http://localhost:80"),
            secure_cookies: env_bool("SECURE_COOKIES", false),
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
            slack_bot_enable: env_bool("SLACK_BOT_ENABLE", false),
            microsoft_key: env_str("MICROSOFT_KEY", ""),
            microsoft_secret: env_str("MICROSOFT_SECRET", ""),
            microsoft_tenant: env_opt("MICROSOFT_TENANT"),
            microsoft_authorization_url: env_opt("MICROSOFT_AUTHORIZATION_URL"),
            microsoft_token_url: env_opt("MICROSOFT_TOKEN_URL"),
            okta_audience: env_str("OKTA_AUDIENCE", ""),
            okta_key: env_str("OKTA_KEY", ""),
            okta_secret: env_str("OKTA_SECRET", ""),
            sendgrid_api_key: env_str("SENDGRID_API_KEY", ""),
            sendgrid_sender: env_str("SENDGRID_SENDER", ""),
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
            open_ai_api_key: env_str("OPEN_AI_API_KEY", ""),
            open_ai_free_limit: env_f64("OPEN_AI_FREE_LIMIT", 5.0),
            open_ai_paid_limit: env_f64("OPEN_AI_PAID_LIMIT", 100.0),
            disable_account_deletion: env_bool("DISABLE_ACCOUNT_DELETION", false),
            disable_show_author: env_bool("DISABLE_SHOW_AUTHOR", false),
        }
    }

    /// Cookie signing secret, including the version suffix that forces re-auth.
    #[must_use]
    pub fn cookie_secret(&self) -> String {
        format!("{}-4.11.5", self.session_secret)
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

    #[must_use]
    pub fn emails_enabled(&self) -> bool {
        !self.mail_smtp_host.is_empty() || !self.sendgrid_api_key.is_empty()
    }
}

fn env_str(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_owned())
}

fn env_opt(key: &str) -> Option<String> {
    env::var(key).ok().filter(|value| !value.is_empty())
}

fn env_bool(key: &str, default: bool) -> bool {
    match env::var(key) {
        Ok(value) => value == "true",
        Err(_) => default,
    }
}

fn env_u16(key: &str, default: u16) -> u16 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_u32(key: &str, default: u32) -> u32 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_u64(key: &str, default: u64) -> u64 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}

fn env_f64(key: &str, default: f64) -> f64 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(default)
}
