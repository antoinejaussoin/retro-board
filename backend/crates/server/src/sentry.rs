//! Sentry error reporting. Off unless `SENTRY_URL` is a DSN.
//!
//! The client is installed on the main thread before Tokio starts, so worker
//! threads inherit it. Hold the returned guard until process exit; dropping it
//! flushes events that are still queued.

use sentry::ClientInitGuard;

use crate::config::Config;
use crate::log;

const DISABLED: &str = "NO_SENTRY";

/// Whether `SENTRY_URL` should open a client.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Status {
    /// Unset, blank, or the explicit `NO_SENTRY` switch.
    Off,
    /// A value was set, but it is not a DSN.
    Invalid,
    /// Panics and `tracing` errors are reported.
    On,
}

/// `SENTRY_URL` is a DSN, so the tracing error layer should be installed.
#[must_use]
pub fn enabled(config: &Config) -> bool {
    status(&config.sentry_url) == Status::On
}

/// Bind a client to this thread.
///
/// Call this before building the async runtime.
#[must_use]
pub fn install(config: &Config) -> Option<ClientInitGuard> {
    let url = config.sentry_url.trim();
    match status(url) {
        Status::Off => {
            log::sentry(false);
            None
        }
        Status::Invalid => {
            log::sentry_ignored();
            None
        }
        Status::On => {
            log::sentry(true);
            Some(sentry::init(client_options(url)))
        }
    }
}

fn status(url: &str) -> Status {
    let url = url.trim();
    if url.is_empty() || url == DISABLED {
        return Status::Off;
    }
    if url.parse::<sentry::types::Dsn>().is_ok() {
        Status::On
    } else {
        Status::Invalid
    }
}

fn client_options(url: &str) -> sentry::ClientOptions {
    let mut options = sentry::ClientOptions::new()
        .dsn(url)
        .release(format!("backend@{}", env!("CARGO_PKG_VERSION")))
        .in_app_include(["retrospected_server"]);
    if let Ok(environment) = std::env::var("NODE_ENV") {
        let environment = environment.trim();
        if !environment.is_empty() {
            options = options.environment(environment.to_owned());
        }
    }
    options
}

#[cfg(test)]
mod tests {
    use super::status;
    use super::Status;

    #[test]
    fn reporting_follows_the_dsn_and_the_off_switch() {
        assert_eq!(status(""), Status::Off);
        assert_eq!(status("   "), Status::Off);
        assert_eq!(status("NO_SENTRY"), Status::Off);
        assert_eq!(status("not a dsn"), Status::Invalid);
        assert_eq!(
            status("https://1234567890abcdef12345@sentry.io/1234567"),
            Status::On
        );
    }
}
