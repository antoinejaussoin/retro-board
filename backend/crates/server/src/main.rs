//! Retrospected HTTP and Socket.IO server.

use retrospected_server::{install_sentry, load_dotenv, run, sentry_enabled, Config};

fn main() {
    load_dotenv();
    let config = Config::from_env();
    init_tracing(sentry_enabled(&config));
    // Installed before the runtime so Tokio worker threads inherit the client.
    let sentry = install_sentry(&config);
    let runtime = match tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(error) => {
            tracing::error!(%error, "could not start the async runtime");
            drop(sentry);
            std::process::exit(1);
        }
    };
    let failed = runtime.block_on(async move {
        match run(config).await {
            Ok(()) => false,
            Err(error) => {
                tracing::error!(%error, "backend stopped");
                true
            }
        }
    });
    drop(sentry);
    if failed {
        std::process::exit(1);
    }
}

fn init_tracing(report_errors: bool) {
    use tracing_subscriber::prelude::*;

    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));
    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_ansi(true)
        .with_target(false)
        .with_filter(filter);
    let registry = tracing_subscriber::registry().with(fmt_layer);
    if report_errors {
        registry
            .with(
                sentry::integrations::tracing::ErrorLayer::new()
                    .with_filter(tracing_subscriber::filter::LevelFilter::ERROR),
            )
            .init();
    } else {
        registry.init();
    }
}
