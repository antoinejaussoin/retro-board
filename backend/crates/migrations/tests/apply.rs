use sqlx::postgres::PgPoolOptions;

#[tokio::test]
async fn fresh_database_applies_every_migration_once() {
    let url = std::env::var("MIG_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@127.0.0.1:5432/postgres".to_owned());
    let admin = PgPoolOptions::new()
        .max_connections(1)
        .connect(&url)
        .await
        .expect("postgres");
    let name = format!("retro_mig_{}", std::process::id());
    sqlx::query(&format!(r#"DROP DATABASE IF EXISTS "{name}""#))
        .execute(&admin)
        .await
        .expect("drop");
    sqlx::query(&format!(r#"CREATE DATABASE "{name}""#))
        .execute(&admin)
        .await
        .expect("create");
    let db_url = url
        .rsplit_once('/')
        .map(|(base, _)| format!("{base}/{name}"))
        .expect("url");
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&db_url)
        .await
        .expect("db");

    let applied = retrospected_migrations::run(&pool).await.expect("migrate");
    let catalogue = retrospected_migrations::catalogue().expect("catalogue");
    assert_eq!(applied, catalogue.len());
    assert_eq!(catalogue.len(), 116);

    let again = retrospected_migrations::run(&pool).await.expect("second");
    assert_eq!(again, 0);

    let recorded = retrospected_migrations::recorded(&pool)
        .await
        .expect("names");
    let expected: Vec<(i64, String)> = catalogue
        .iter()
        .map(|m| (m.timestamp, m.name.clone()))
        .collect();
    let actual: Vec<(i64, String)> = recorded;
    assert_eq!(actual, expected);

    let sessions: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'user_view'"#,
    )
    .fetch_one(&pool)
    .await
    .expect("view");
    assert_eq!(sessions, 1);

    if std::env::var("KEEP_MIG_DB").is_err() {
        drop(pool);
        sqlx::query(&format!(r#"DROP DATABASE IF EXISTS "{name}" WITH (FORCE)"#))
            .execute(&admin)
            .await
            .ok();
    } else {
        eprintln!("kept {db_url}");
    }
}
