//! Express-session compatible cookies and Redis `sess:` records.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use chrono::{Duration as ChronoDuration, Utc};
use cookie::Cookie;
use redis::aio::ConnectionManager;
use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::config::Config;
use crate::crypto::{sign_cookie, unsign_session};
use crate::models::split_ids;

const COOKIE_NAME: &str = "connect.sid";
const YEAR_MS: i64 = 1000 * 60 * 60 * 24 * 365;

#[derive(Clone)]
pub struct SessionStore {
    secret: String,
    secure: bool,
    redis: Option<ConnectionManager>,
    memory: Arc<Mutex<HashMap<String, String>>>,
}

#[derive(Clone, Debug)]
pub struct Session {
    pub id: String,
    pub passport_user: Option<String>,
    pub socket_id: Option<String>,
    pub raw: Value,
}

impl Session {
    pub fn user_ids(&self) -> Option<(String, String)> {
        self.passport_user.as_deref().and_then(split_ids)
    }
}

impl SessionStore {
    pub async fn connect(config: &Config) -> Result<Self, redis::RedisError> {
        let redis = if config.redis_enabled {
            let client = redis::Client::open(config.redis_url())?;
            Some(ConnectionManager::new(client).await?)
        } else {
            None
        };
        Ok(Self {
            secret: config.cookie_secret(),
            secure: config.secure_cookies,
            redis,
            memory: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    pub fn from_cookie(&self, header: Option<&str>) -> Option<String> {
        let header = header?;
        for part in header.split(';') {
            let Ok(cookie) = Cookie::parse(part.trim()) else {
                continue;
            };
            if cookie.name() == COOKIE_NAME {
                return unsign_session(cookie.value(), &self.secret);
            }
        }
        None
    }

    pub fn set_cookie_header(&self, sid: &str) -> String {
        let signed = format!("s:{}", sign_cookie(sid, &self.secret));
        let mut cookie = Cookie::build((COOKIE_NAME, signed))
            .path("/")
            .http_only(true)
            .same_site(cookie::SameSite::Lax)
            .max_age(cookie::time::Duration::seconds(YEAR_MS / 1000))
            .secure(self.secure);
        let _ = &mut cookie;
        cookie.build().to_string()
    }

    pub async fn load(&self, sid: &str) -> Option<Session> {
        let raw = self.read_raw(sid).await?;
        let value: Value = serde_json::from_str(&raw).ok()?;
        Some(Session {
            id: sid.to_owned(),
            passport_user: value
                .pointer("/passport/user")
                .and_then(Value::as_str)
                .map(str::to_owned),
            socket_id: value
                .get("socketId")
                .and_then(Value::as_str)
                .map(str::to_owned),
            raw: value,
        })
    }

    pub async fn create(&self) -> Session {
        let sid = new_sid();
        let session = Session {
            id: sid,
            passport_user: None,
            socket_id: None,
            raw: json!({}),
        };
        self.save(&session).await;
        session
    }

    pub async fn save(&self, session: &Session) {
        let mut body = session.raw.clone();
        if !body.is_object() {
            body = json!({});
        }
        let expires = Utc::now() + ChronoDuration::milliseconds(YEAR_MS);
        body["cookie"] = json!({
            "originalMaxAge": YEAR_MS,
            "expires": expires.to_rfc3339(),
            "secure": self.secure,
            "httpOnly": true,
            "path": "/"
        });
        if let Some(user) = &session.passport_user {
            body["passport"] = json!({ "user": user });
        } else {
            body.as_object_mut().map(|map| map.remove("passport"));
        }
        if let Some(socket_id) = &session.socket_id {
            body["socketId"] = json!(socket_id);
        }
        let encoded = body.to_string();
        self.write_raw(&session.id, &encoded).await;
    }

    pub async fn destroy(&self, sid: &str) {
        if let Some(redis) = &self.redis {
            let mut conn = redis.clone();
            let _: Result<(), _> = redis::cmd("DEL")
                .arg(format!("sess:{sid}"))
                .query_async(&mut conn)
                .await;
        }
        self.memory.lock().await.remove(sid);
    }

    async fn read_raw(&self, sid: &str) -> Option<String> {
        if let Some(redis) = &self.redis {
            let mut conn = redis.clone();
            let value: Option<String> = redis::cmd("GET")
                .arg(format!("sess:{sid}"))
                .query_async(&mut conn)
                .await
                .ok()?;
            if value.is_some() {
                return value;
            }
        }
        self.memory.lock().await.get(sid).cloned()
    }

    async fn write_raw(&self, sid: &str, value: &str) {
        if let Some(redis) = &self.redis {
            let mut conn = redis.clone();
            let _: Result<(), _> = redis::cmd("SET")
                .arg(format!("sess:{sid}"))
                .arg(value)
                .arg("PX")
                .arg(YEAR_MS)
                .query_async(&mut conn)
                .await;
        }
        self.memory
            .lock()
            .await
            .insert(sid.to_owned(), value.to_owned());
    }
}

fn new_sid() -> String {
    use rand::RngCore;
    let mut bytes = [0u8; 24];
    rand::thread_rng().fill_bytes(&mut bytes);
    base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, bytes)
}

/// Fixed-window counter used for the HTTP and websocket limiters.
#[derive(Clone)]
pub struct RateLimiter {
    limit: u32,
    window: Duration,
    hits: Arc<Mutex<HashMap<String, (std::time::Instant, u32)>>>,
}

impl RateLimiter {
    pub fn new(limit: u32, window: Duration) -> Self {
        Self {
            limit,
            window,
            hits: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn allow(&self, key: &str) -> bool {
        let mut hits = self.hits.lock().await;
        let now = std::time::Instant::now();
        let entry = hits.entry(key.to_owned()).or_insert((now, 0));
        if now.duration_since(entry.0) > self.window {
            *entry = (now, 0);
        }
        entry.1 += 1;
        entry.1 <= self.limit
    }
}
