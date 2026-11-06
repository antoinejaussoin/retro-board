//! Two backend processes share Socket.IO rooms through Redis.

use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::Duration;

use serde_json::Value;

struct Node {
    child: std::process::Child,
    base: String,
}

struct Harness {
    nodes: Vec<Node>,
    db: String,
}

impl Drop for Harness {
    fn drop(&mut self) {
        for node in &mut self.nodes {
            let _ = node.child.kill();
            let _ = node.child.wait();
        }
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

fn psql(db: &str, sql: &str) {
    let output = Command::new("psql")
        .env("PGPASSWORD", "postgres")
        .args(["-h", "127.0.0.1", "-U", "postgres", "-d", db, "-c", sql])
        .output()
        .expect("psql");
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
}

fn spawn(db: &str, port: u16) -> Node {
    let log = std::fs::File::create(format!("/tmp/retro-io-{port}.log")).expect("log");
    let log_err = log.try_clone().expect("log");
    let child = Command::new(server_bin())
        .env("DB_HOST", "127.0.0.1")
        .env("DB_PORT", "5432")
        .env("DB_USER", "postgres")
        .env("DB_PASSWORD", "postgres")
        .env("DB_NAME", db)
        .env("REDIS_ENABLED", "true")
        .env("REDIS_HOST", "127.0.0.1")
        .env("REDIS_FOR_SOCKETIO_ENABLED", "true")
        .env("SELF_HOSTED", "true")
        .env("SELF_HOSTED_ADMIN", "admin@localhost")
        .env("BACKEND_PORT", port.to_string())
        .env("SESSION_SECRET", "test-secret")
        .env("RUST_LOG", "info,socketioxide=debug")
        .stdout(Stdio::from(log))
        .stderr(Stdio::from(log_err))
        .spawn()
        .expect("spawn backend");
    Node {
        child,
        base: format!("http://127.0.0.1:{port}"),
    }
}

async fn wait_healthy(base: &str) {
    let client = reqwest::Client::new();
    for _ in 0..50 {
        if client
            .get(format!("{base}/healthz"))
            .send()
            .await
            .ok()
            .is_some_and(|response| response.status().is_success())
        {
            return;
        }
        tokio::time::sleep(Duration::from_millis(200)).await;
    }
    let port = base.rsplit_once(':').map(|(_, port)| port).unwrap_or("");
    let log = std::fs::read_to_string(format!("/tmp/retro-io-{port}.log")).unwrap_or_default();
    panic!("backend {base} did not become healthy\n{log}");
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

fn cookie_of(response: &reqwest::Response) -> String {
    response
        .headers()
        .get_all(reqwest::header::SET_COOKIE)
        .iter()
        .filter_map(|value| value.to_str().ok())
        .find_map(|value| value.split(';').next().map(str::to_owned))
        .expect("set-cookie")
}

#[tokio::test]
async fn post_on_one_node_reaches_the_other() {
    let db = format!("retro_io_{}", std::process::id());
    psql("postgres", &format!("DROP DATABASE IF EXISTS \"{db}\""));
    psql(
        "postgres",
        &format!("CREATE DATABASE \"{db}\" OWNER postgres"),
    );
    let port_a = 18000 + (std::process::id() % 1000) as u16;
    let port_b = port_a + 1;
    let mut harness = Harness {
        nodes: vec![spawn(&db, port_a)],
        db,
    };
    wait_healthy(&harness.nodes[0].base).await;
    harness.nodes.push(spawn(&harness.db, port_b));
    wait_healthy(&harness.nodes[1].base).await;

    let http = reqwest::Client::new();
    let login = http
        .post(format!(
            "{}/api/auth/anonymous/login",
            harness.nodes[0].base
        ))
        .json(&serde_json::json!({"username": "ANONUSER__Rio__ANONUSER", "password": "secret"}))
        .send()
        .await
        .unwrap();
    assert_eq!(login.status(), 200);
    let cookie = cookie_of(&login);
    let created: Value = http
        .post(format!("{}/api/create", harness.nodes[0].base))
        .header("cookie", &cookie)
        .json(&serde_json::json!({}))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    let session_id = created["id"].as_str().unwrap().to_owned();

    let client_dir = PathBuf::from("/tmp/retro-socket-client");
    if !client_dir.join("node_modules/socket.io-client").exists() {
        std::fs::create_dir_all(&client_dir).unwrap();
        let install = Command::new("npm")
            .args(["install", "--silent", "socket.io-client@4.8.4"])
            .current_dir(&client_dir)
            .status()
            .expect("npm");
        assert!(install.success(), "socket.io-client install failed");
    }
    let check = Command::new("node")
        .arg(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/socket-check.mjs"))
        .arg(&harness.nodes[0].base)
        .arg(&harness.nodes[1].base)
        .arg(&cookie)
        .arg(&session_id)
        .env(
            "SOCKET_IO_CLIENT",
            client_dir.join("node_modules/socket.io-client"),
        )
        .output()
        .expect("node");
    assert!(
        check.status.success(),
        "socket check failed\nstdout:{}\nstderr:{}",
        String::from_utf8_lossy(&check.stdout),
        String::from_utf8_lossy(&check.stderr)
    );
    drop(harness);
}
