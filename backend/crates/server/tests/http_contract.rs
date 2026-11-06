//! Black-box checks against a running Retrospected backend.

use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::Duration;

use serde_json::Value;

struct Server {
    child: std::process::Child,
    base: String,
    db: String,
}

impl Drop for Server {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
        let _ = Command::new("psql")
            .env("PGPASSWORD", "postgres")
            .args([
                "-h",
                "127.0.0.1",
                "-U",
                "postgres",
                "-d",
                "postgres",
                "-c",
                &format!("DROP DATABASE IF EXISTS \"{}\" WITH (FORCE)", self.db),
            ])
            .output();
    }
}

fn psql(db: &str, sql: &str) -> String {
    let output = Command::new("psql")
        .env("PGPASSWORD", "postgres")
        .args([
            "-h",
            "127.0.0.1",
            "-U",
            "postgres",
            "-d",
            db,
            "-At",
            "-c",
            sql,
        ])
        .output()
        .expect("psql");
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8_lossy(&output.stdout).trim().to_owned()
}

async fn boot() -> Server {
    let db = format!("retro_api_{}", std::process::id());
    psql("postgres", &format!("DROP DATABASE IF EXISTS \"{db}\""));
    psql(
        "postgres",
        &format!("CREATE DATABASE \"{db}\" OWNER postgres"),
    );
    let port = 3400 + (std::process::id() % 1000);
    let mut child = Command::new(server_bin())
        .env("DB_HOST", "127.0.0.1")
        .env("DB_PORT", "5432")
        .env("DB_USER", "postgres")
        .env("DB_PASSWORD", "postgres")
        .env("DB_NAME", &db)
        .env("REDIS_ENABLED", "true")
        .env("REDIS_HOST", "127.0.0.1")
        .env("SELF_HOSTED", "true")
        .env("SELF_HOSTED_ADMIN", "admin@localhost")
        .env("BACKEND_PORT", port.to_string())
        .env("SESSION_SECRET", "test-secret")
        .env("ANTHROPIC_API_KEY", "")
        .env("STRIPE_SECRET", "sk_test_dummy")
        .env("STRIPE_WEBHOOK_SECRET", "whsec_test")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn backend");
    let base = format!("http://127.0.0.1:{port}");
    let client = reqwest::Client::new();
    for _ in 0..50 {
        if client
            .get(format!("{base}/healthz"))
            .send()
            .await
            .ok()
            .is_some_and(|r| r.status().is_success())
        {
            return Server { child, base, db };
        }
        tokio::time::sleep(Duration::from_millis(200)).await;
    }
    let _ = child.kill();
    let _ = child.wait();
    panic!("backend did not become healthy");
}

fn server_bin() -> PathBuf {
    let path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../target/debug/retrospected-server");
    assert!(
        path.is_file(),
        "missing server binary at {}; run cargo build -p retrospected-server before cargo test",
        path.display()
    );
    path
}

fn cookie_from(response: &reqwest::Response) -> String {
    response
        .headers()
        .get_all(reqwest::header::SET_COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok())
        .find_map(|value| value.split(';').next().map(str::to_owned))
        .expect("set-cookie")
}

#[tokio::test]
async fn http_contract() {
    let server = boot().await;
    let client = reqwest::Client::new();
    let ping = client
        .get(format!("{}/api/ping", server.base))
        .send()
        .await
        .unwrap();
    assert_eq!(ping.text().await.unwrap(), "pong");

    let caps: Value = client
        .get(format!("{}/api/admin/self-hosting", server.base))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(caps["selfHosted"], true);
    assert_eq!(caps["oAuth"]["google"], false);
    assert_eq!(caps["adminEmail"], "admin@localhost");

    let anon = client
        .post(format!("{}/api/auth/anonymous/login", server.base))
        .json(&serde_json::json!({"username": "ANONUSER__Ada__ANONUSER", "password": "secret"}))
        .send()
        .await
        .unwrap();
    assert_eq!(anon.status(), 200);
    let cookie = cookie_from(&anon);
    let me: Value = client
        .get(format!("{}/api/me", server.base))
        .header("cookie", &cookie)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(me["name"], "Ada");
    assert_eq!(me["accountType"], "anonymous");

    // The home page starts a retro with Content-Type: application/json and no body.
    let created = client
        .post(format!("{}/api/create", server.base))
        .header("cookie", &cookie)
        .header("content-type", "application/json")
        .body("")
        .send()
        .await
        .unwrap();
    assert_eq!(
        created.status(),
        200,
        "starting a retro must accept an empty JSON body, got {}",
        created.status()
    );
    let created: Value = created.json().await.unwrap();
    let session_id = created["id"].as_str().unwrap().to_owned();
    assert_eq!(created["columns"].as_array().unwrap().len(), 3);
    assert!(created["encrypted"].is_null());

    let encrypted = client
        .post(format!("{}/api/create", server.base))
        .header("cookie", &cookie)
        .header("content-type", "application/json")
        .body(r#"{"encryptedCheck":"check-value"}"#)
        .send()
        .await
        .unwrap();
    assert_eq!(encrypted.status(), 200);
    let encrypted: Value = encrypted.json().await.unwrap();
    assert_eq!(encrypted["encrypted"], "check-value");
    let encrypted_id = encrypted["id"].as_str().unwrap();

    let summary_anon = client
        .post(format!("{}/api/ai/summary", server.base))
        .json(&serde_json::json!({"id": encrypted_id}))
        .send()
        .await
        .unwrap();
    assert_eq!(summary_anon.status(), 401, "summary requires a login");
    let stored_anon = client
        .get(format!("{}/api/ai/summary/{encrypted_id}", server.base))
        .send()
        .await
        .unwrap();
    assert_eq!(
        stored_anon.status(),
        401,
        "reading a summary requires a login"
    );
    let edit_anon = client
        .patch(format!("{}/api/ai/summary/{encrypted_id}", server.base))
        .json(&serde_json::json!({"summary": "edited"}))
        .send()
        .await
        .unwrap();
    assert_eq!(
        edit_anon.status(),
        401,
        "editing a summary requires a login"
    );

    let summary_encrypted = client
        .post(format!("{}/api/ai/summary", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"id": encrypted_id}))
        .send()
        .await
        .unwrap();
    assert_eq!(
        summary_encrypted.status(),
        403,
        "an encrypted board must not be sent to the model"
    );

    psql(
        &server.db,
        &format!("UPDATE sessions SET options_blur_cards = true WHERE id = '{session_id}'"),
    );
    let summary_blurred = client
        .post(format!("{}/api/ai/summary", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"id": session_id}))
        .send()
        .await
        .unwrap();
    assert_eq!(summary_blurred.status(), 403, "blurred cards stay hidden");
    psql(
        &server.db,
        &format!("UPDATE sessions SET options_blur_cards = false WHERE id = '{session_id}'"),
    );

    let summary_missing_key = client
        .post(format!("{}/api/ai/summary", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"id": session_id}))
        .send()
        .await
        .unwrap();
    assert_eq!(summary_missing_key.status(), 500);
    assert_eq!(
        summary_missing_key.text().await.unwrap(),
        "AI is not configured"
    );
    let stored: Value = client
        .get(format!("{}/api/ai/summary/{session_id}", server.base))
        .header("cookie", &cookie)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert!(
        stored["summary"].is_null(),
        "a new board has no saved summary"
    );
    assert_eq!(stored["stale"], false);

    let email = format!("ada-{}@example.com", std::process::id());
    let registered: Value = client
        .post(format!("{}/api/register", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"name": "Ada Lovelace", "username": email, "password": "correct-horse", "language": "en-GB"}))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(registered["loggedIn"], true);
    let cookie = cookie_from(
        &client
            .post(format!("{}/api/auth/login", server.base))
            .json(&serde_json::json!({"username": email, "password": "correct-horse"}))
            .send()
            .await
            .unwrap(),
    );

    let quota: Value = client
        .get(format!("{}/api/quota", server.base))
        .header("cookie", &cookie)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(quota["quota"], 50);

    let previous: Value = client
        .get(format!("{}/api/previous", server.base))
        .header("cookie", &cookie)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert!(previous
        .as_array()
        .unwrap()
        .iter()
        .any(|item| item["id"] == session_id));

    let renamed: Value = client
        .post(format!("{}/api/me/username", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"name": "Ada Lovelace"}))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(renamed["name"], "Ada Lovelace");
    let translated: Value = client
        .post(format!("{}/api/me/language", server.base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({"language": "fr-FR"}))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(translated["language"], "fr-FR");
    assert_eq!(
        client
            .delete(format!("{}/api/session/{session_id}", server.base))
            .header("cookie", &cookie)
            .send()
            .await
            .unwrap()
            .status(),
        200
    );
    let gmail: bool = client
        .get(format!("{}/api/stripe/domain/gmail.com", server.base))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    let custom: bool = client
        .get(format!(
            "{}/api/stripe/domain/retrospected.com",
            server.base
        ))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert!(!gmail);
    assert!(custom);

    let missing = client
        .post(format!("{}/api/reset", server.base))
        .json(&serde_json::json!({"email": "missing@example.com"}))
        .send()
        .await
        .unwrap();
    assert_eq!(missing.status(), 404);
    assert_eq!(
        client
            .post(format!("{}/api/reset", server.base))
            .json(&serde_json::json!({"email": email}))
            .send()
            .await
            .unwrap()
            .status(),
        200
    );
    let code = psql(
        &server.db,
        &format!("SELECT email_verification FROM users_identities WHERE username = '{email}'"),
    );
    assert!(!code.is_empty());
    let reset = client
        .post(format!("{}/api/reset-password", server.base))
        .json(&serde_json::json!({"email": email, "code": code, "password": "new-password"}))
        .send()
        .await
        .unwrap();
    assert_eq!(reset.status(), 200);
    let cookie = cookie_from(&reset);

    let webhook = client
        .post(format!("{}/api/stripe/webhook", server.base))
        .header("stripe-signature", "t=1,v1=deadbeef")
        .body("{}")
        .send()
        .await
        .unwrap();
    assert_eq!(webhook.status(), 400);

    let ai = client
        .post(format!("{}/api/ai/chat", server.base))
        .json(&serde_json::json!({"id": "c", "messages": []}))
        .send()
        .await
        .unwrap();
    assert_eq!(ai.status(), 401);

    let demo: Value = client
        .post(format!("{}/api/demo", server.base))
        .header("cookie", &cookie)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    assert_eq!(demo["demo"], true);
    assert_eq!(demo["name"], "My Retro Demo");

    let deleted = client
        .delete(format!("{}/api/me", server.base))
        .header("cookie", &cookie)
        .json(
            &serde_json::json!({"deleteSessions": true, "deletePosts": true, "deleteVotes": true}),
        )
        .send()
        .await
        .unwrap();
    assert_eq!(deleted.status(), 200);
    assert_eq!(
        client
            .get(format!("{}/api/me", server.base))
            .header("cookie", &cookie)
            .send()
            .await
            .unwrap()
            .status(),
        401
    );
}
