//! Process-wide handles shared by HTTP and Socket.IO handlers.

use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;

use serde_json::Value;
use socketioxide::adapter::Adapter;
use socketioxide::SocketIo;
use sqlx::PgPool;
use std::sync::OnceLock;
use tokio::sync::Mutex;

use crate::config::Config;
use crate::licence::Licence;
use crate::session::{RateLimiter, SessionStore};

/// Socket.IO operations used outside a socket handler. Both the local adapter and the Redis
/// adapter implement this, so HTTP routes can emit without knowing which one is running.
pub trait ClusterIo: Send + Sync {
    fn local_client_count(&self) -> usize;
    fn emit_to(
        &self,
        target: &str,
        event: &str,
        data: &Value,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>>;
}

impl<A> ClusterIo for SocketIo<A>
where
    A: Adapter + socketioxide_core::adapter::DefinedAdapter,
{
    fn local_client_count(&self) -> usize {
        self.sockets().len()
    }

    fn emit_to(
        &self,
        target: &str,
        event: &str,
        data: &Value,
    ) -> Pin<Box<dyn Future<Output = ()> + Send>> {
        let io = self.clone();
        let target = target.to_owned();
        let event = event.to_owned();
        let data = data.clone();
        Box::pin(async move {
            if let Err(error) = io.to(target).emit(event, &data).await {
                tracing::debug!(%error, "socket.io emit failed");
            }
        })
    }
}

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub sessions: SessionStore,
    pub licence: Arc<Mutex<Option<Licence>>>,
    pub http_limit: RateLimiter,
    pub ws_limit: RateLimiter,
    pub io: Arc<OnceLock<Arc<dyn ClusterIo>>>,
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
