//! Apply the historical TypeORM migrations and exit.

use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    let url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        let host = std::env::var("DB_HOST").unwrap_or_else(|_| "postgres".into());
        let port = std::env::var("DB_PORT").unwrap_or_else(|_| "5432".into());
        let user = std::env::var("DB_USER").unwrap_or_else(|_| "postgres".into());
        let password = std::env::var("DB_PASSWORD").unwrap_or_else(|_| "postgres".into());
        let name = std::env::var("DB_NAME").unwrap_or_else(|_| "retroboard".into());
        format!("postgres://{user}:{password}@{host}:{port}/{name}")
    });
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&url)
        .await
        .expect("connect to postgres");
    let applied = retrospected_migrations::run(&pool)
        .await
        .expect("apply migrations");
    println!("applied {applied} migrations");
}
