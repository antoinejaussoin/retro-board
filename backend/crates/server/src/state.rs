//! Process-wide handles shared by HTTP and Socket.IO handlers.

use std::sync::Arc;
use std::time::Duration;

use socketioxide::SocketIo;
use sqlx::PgPool;
use std::sync::OnceLock;
use tokio::sync::Mutex;

use crate::config::Config;
use crate::licence::Licence;
use crate::session::{RateLimiter, SessionStore};

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub sessions: SessionStore,
    pub licence: Arc<Mutex<Option<Licence>>>,
    pub http_limit: RateLimiter,
    pub ws_limit: RateLimiter,
    pub io: Arc<OnceLock<SocketIo>>,
}

impl AppState {
    pub fn force_pro(&self) -> bool {
        self.config.self_hosted
            && self
                .licence
                .try_lock()
                .ok()
                .and_then(|guard| guard.clone())
                .is_some()
    }
}

pub fn limiters(config: &Config) -> (RateLimiter, RateLimiter) {
    (
        RateLimiter::new(
            config.rate_limit_max,
            Duration::from_millis(config.rate_limit_window_ms),
        ),
        RateLimiter::new(
            config.rate_limit_ws_points,
            Duration::from_secs(config.rate_limit_ws_duration),
        ),
    )
}
