//! Replays the historical TypeORM migrations and records them in the same
//! `migrations` table (`id`, `timestamp`, `name`).

mod lexorank;
mod procedural;

use serde::Deserialize;
use sqlx::PgPool;
use thiserror::Error;

pub use lexorank::Rank;

const MIGRATIONS_JSON: &str = include_str!("../data/migrations.json");
/// Primary key name TypeORM generates for `migrations(id)` via its SHA1 naming strategy.
const MIGRATIONS_PK: &str = "PK_8c82d7f526340ab734260ea46be";

#[derive(Debug, Error)]
pub enum Error {
    #[error("migration data is invalid: {0}")]
    Data(#[from] serde_json::Error),
    #[error("migration {name} failed: {source}")]
    Migration {
        name: String,
        #[source]
        source: sqlx::Error,
    },
    #[error(transparent)]
    Database(#[from] sqlx::Error),
    #[error("{0}")]
    Message(String),
}

#[derive(Debug, Deserialize)]
struct FileMigration {
    name: String,
    timestamp: i64,
    kind: String,
    steps: Vec<Step>,
}

#[derive(Debug, Deserialize)]
struct Step {
    sql: String,
    params: Vec<Option<String>>,
}

/// A migration loaded from the extracted TypeORM history.
#[derive(Debug)]
pub struct Migration {
    pub name: String,
    pub timestamp: i64,
    kind: String,
    steps: Vec<Step>,
}

/// Every historical migration, ordered the way TypeORM orders them.
///
/// # Errors
/// Returns an error when the embedded catalogue cannot be parsed.
pub fn catalogue() -> Result<Vec<Migration>, Error> {
    let raw: Vec<FileMigration> = serde_json::from_str(MIGRATIONS_JSON)?;
    Ok(raw
        .into_iter()
        .map(|item| Migration {
            name: item.name,
            timestamp: item.timestamp,
            kind: item.kind,
            steps: item.steps,
        })
        .collect())
}

/// Apply pending migrations. Returns how many were applied.
///
/// # Errors
/// Returns an error when the database rejects a statement. The transaction is rolled back.
pub async fn run(pool: &PgPool) -> Result<usize, Error> {
    let migrations = catalogue()?;
    let mut tx = pool.begin().await?;
    ensure_table(&mut tx).await?;
    let applied = applied_names(&mut tx).await?;
    let mut count = 0;
    for migration in &migrations {
        if applied.iter().any(|name| name == &migration.name) {
            continue;
        }
        apply(&mut tx, migration)
            .await
            .map_err(|source| Error::Migration {
                name: migration.name.clone(),
                source,
            })?;
        sqlx::query(r#"INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)"#)
            .bind(migration.timestamp)
            .bind(&migration.name)
            .execute(&mut *tx)
            .await?;
        count += 1;
        tracing::info!(migration = %migration.name, "applied migration");
    }
    tx.commit().await?;
    Ok(count)
}

/// Names already stored in `migrations`, in insertion order.
///
/// # Errors
/// Returns an error when the table cannot be read. An absent table yields an empty list.
pub async fn recorded(pool: &PgPool) -> Result<Vec<(i64, String)>, Error> {
    let exists = table_exists(pool).await?;
    if !exists {
        return Ok(Vec::new());
    }
    let rows = sqlx::query_as::<_, (i64, String)>(
        r#"SELECT "timestamp", "name" FROM "migrations" ORDER BY "id""#,
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

async fn table_exists(pool: &PgPool) -> Result<bool, sqlx::Error> {
    let exists = sqlx::query_scalar::<_, bool>(
        r#"SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'migrations'
        )"#,
    )
    .fetch_one(pool)
    .await?;
    Ok(exists)
}

async fn ensure_table(tx: &mut sqlx::Transaction<'_, sqlx::Postgres>) -> Result<(), sqlx::Error> {
    sqlx::query(&format!(
        r#"CREATE TABLE IF NOT EXISTS "migrations" (
            "id" SERIAL NOT NULL,
            "timestamp" bigint NOT NULL,
            "name" character varying NOT NULL,
            CONSTRAINT "{MIGRATIONS_PK}" PRIMARY KEY ("id")
        )"#
    ))
    .execute(&mut **tx)
    .await?;
    // TypeORM creates this before running migrations when view entities are registered.
    sqlx::query(
        r#"CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
            "type" character varying NOT NULL,
            "database" character varying,
            "schema" character varying,
            "table" character varying,
            "name" character varying,
            "value" text
        )"#,
    )
    .execute(&mut **tx)
    .await?;
    Ok(())
}

async fn applied_names(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>(r#"SELECT "name" FROM "migrations" ORDER BY "id""#)
        .fetch_all(&mut **tx)
        .await
}

async fn apply(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    migration: &Migration,
) -> Result<(), sqlx::Error> {
    match migration.kind.as_str() {
        "initial" => procedural::initial(tx, &migration.steps).await?,
        "rerank" => procedural::rerank(tx).await?,
        "identities" => procedural::identities(tx).await?,
        _ => {
            for step in &migration.steps {
                execute_step(tx, step).await?;
            }
        }
    }
    Ok(())
}

pub(crate) async fn execute_step(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    step: &Step,
) -> Result<(), sqlx::Error> {
    if step.sql.trim().is_empty() {
        return Ok(());
    }
    let mut query = sqlx::query(&step.sql);
    for param in &step.params {
        query = query.bind(param);
    }
    query.execute(&mut **tx).await?;
    Ok(())
}
