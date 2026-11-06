//! Self-hosted licence checks: hardcoded bcrypt entries, then the public licence API.

use std::time::Duration;

use serde::Deserialize;
use tokio::sync::Mutex;

use crate::config::Config;
use crate::crypto::{decrypt_cryptojs, verify_password};

#[derive(Clone, Debug)]
pub struct Licence {
    pub owner: String,
}

#[derive(Deserialize)]
struct RemoteLicence {
    owner: Option<String>,
    licence: Option<String>,
}

struct Hardcoded {
    hash: &'static str,
    encrypted_owner: &'static str,
}

const HARDCODED: &[Hardcoded] = &[
    Hardcoded {
        hash: "$2a$10$kt4DnxKZEwvoh052JFygru7iLiIrTzSJngcJlaYkWm.tlNzRJx/Di",
        encrypted_owner: "U2FsdGVkX18/e8sfZ3bpjz3pLQkCxloH8nuniFdU+vo=",
    },
    Hardcoded {
        hash: "$2a$10$33O/3uuETs0hKNIRWQzH5uQ8LgvZKhZumDcfy.izLLIzwqXmHRFu2",
        encrypted_owner: "U2FsdGVkX1/weIyFN+TJEPkM0YF08D5CSD0vgrDOnouEveyXG2K/TurX63pBrhuR",
    },
    Hardcoded {
        hash: "$2a$10$hLlxhJ8yDp1lQJtTLePJr.SDuWFHSX4Kat8NHUgqPoKgRGLbZWy26",
        encrypted_owner: "U2FsdGVkX19b7JIgy/QrMncC1JjoVmBJ5EUo4AcGIkA=",
    },
    Hardcoded {
        hash: "$2a$10$y3ZX441HpKqjMfemCB285O0.JzuaO5wGBPLtS5vJTQ6T352E9O0bC",
        encrypted_owner: "U2FsdGVkX1+xZTCbhmVh4jBPCZfiJ5kipc0Yeo8bm/8CjEoLG8VK/Z1mwTEKxKlR",
    },
    Hardcoded {
        hash: "$2a$10$udpIRa0hWeurSsaXtM0iveT4geuQBuGvnNS9UqczkgxOYzHaPqau.",
        encrypted_owner: "U2FsdGVkX1/DQ2JJ57C+LGM7XBLLg9NDxviOwRwj0pI=",
    },
    Hardcoded {
        hash: "$2a$10$R1N5dO2kz78iG3wk6DPs1ODwY9YlHz7uWoIY1TjsasHb1mDOLDSdu",
        encrypted_owner: "U2FsdGVkX19/vrNOsM2pKKpKOf4ej7UUSfWHwNU9yeY=",
    },
    Hardcoded {
        hash: "$2a$10$gRfPyZCnZ6Vj3i7sn9W2YOmTF6QRBq9ha5d.52xpo6vW0htyagnB2",
        encrypted_owner: "U2FsdGVkX1+HbvAW4sVZW4V5U22S/FY1uwbp/ks1JJnn2bc/iwbaGYcRrS5UCBer",
    },
];

pub async fn resolve(config: &Config) -> Option<Licence> {
    if let Some(licence) = hardcoded(&config.licence_key).await {
        tracing::info!(owner = %licence.owner, "hardcoded licence accepted");
        return Some(licence);
    }
    if config.licence_key.is_empty() {
        return None;
    }
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .ok()?;
    let response = client
        .post("https://app.retrospected.com/api/self-hosted-licence")
        .json(&serde_json::json!({ "key": config.licence_key }))
        .send()
        .await
        .ok()?;
    if !response.status().is_success() {
        tracing::warn!(status = %response.status(), "licence server rejected the key");
        return None;
    }
    let body: RemoteLicence = response.json().await.ok()?;
    Some(Licence {
        owner: body
            .owner
            .unwrap_or_else(|| body.licence.unwrap_or_default()),
    })
}

async fn hardcoded(key: &str) -> Option<Licence> {
    if key.is_empty() {
        return None;
    }
    for entry in HARDCODED {
        if verify_password(key, entry.hash).unwrap_or(false) {
            let owner = decrypt_cryptojs(entry.encrypted_owner, key);
            if !owner.is_empty() {
                return Some(Licence { owner });
            }
        }
    }
    None
}

#[allow(dead_code)]
pub async fn is_licenced(slot: &Mutex<Option<Licence>>) -> bool {
    slot.lock().await.is_some()
}
