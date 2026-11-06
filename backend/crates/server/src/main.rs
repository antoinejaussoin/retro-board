//! Retrospected HTTP and Socket.IO server.

use retrospected_server::{load_dotenv, run, Config};

#[tokio::main]
async fn main() {
    load_dotenv();
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));
    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(true)
        .with_target(false)
        .init();
    let config = Config::from_env();
    if let Err(error) = run(config).await {
        tracing::error!(%error, "backend stopped");
        std::process::exit(1);
    }
}
