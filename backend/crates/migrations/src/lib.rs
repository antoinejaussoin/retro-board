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

/// Append an empty SQL migration to a catalogue without rewriting the existing entries.
///
/// Fill in the new `sql` field before the server starts. An empty statement is recorded
/// and then skipped forever.
///
/// # Errors
/// Returns an error when the catalogue is not a JSON array, the title is empty, or the
/// name is already present.
pub fn append_sql_migration(catalogue: &str, title: &str, timestamp: i64) -> Result<String, Error> {
    let title = title.trim();
    if title.is_empty() || !title.chars().all(|ch| ch.is_ascii_alphanumeric()) {
        return Err(Error::Message(
            "migration title must be letters and digits, for example AddWidget".into(),
        ));
    }
    let name = format!("{title}{timestamp}");
    let existing: Vec<serde_json::Value> = serde_json::from_str(catalogue)?;
    if existing
        .iter()
        .any(|item| item.get("name").and_then(serde_json::Value::as_str) == Some(name.as_str()))
    {
        return Err(Error::Message(format!("migration {name} already exists")));
    }
    let entry = format!(
        r#"  {{
    "name": "{name}",
    "timestamp": {timestamp},
    "kind": "sql",
    "steps": [
      {{
        "sql": "",
        "params": []
      }}
    ]
  }}"#
    );
    let trimmed = catalogue.trim_end();
    let Some(without) = trimmed.strip_suffix(']') else {
        return Err(Error::Message(
            "migration catalogue must be a JSON array".into(),
        ));
    };
    let without = without.trim_end();
    let updated = if without.ends_with('[') {
        format!("{without}\n{entry}\n]\n")
    } else {
        format!("{without},\n{entry}\n]\n")
    };
    let parsed: Vec<serde_json::Value> = serde_json::from_str(&updated)?;
    if parsed.len() != existing.len() + 1 {
        return Err(Error::Message(
            "appending the migration did not produce one new entry".into(),
        ));
    }
    Ok(updated)
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

#[cfg(test)]
mod tests {
    use super::append_sql_migration;

    #[test]
    fn append_keeps_existing_entries_and_adds_one() {
        let catalogue = "[\n  {\n    \"name\": \"Initial1\",\n    \"timestamp\": 1,\n    \"kind\": \"sql\",\n    \"steps\": []\n  }\n]\n";
        let updated = append_sql_migration(catalogue, "AddWidget", 99).expect("append");
        assert!(updated.contains("Initial1"));
        assert!(updated.contains("AddWidget99"));
        let parsed: Vec<serde_json::Value> = serde_json::from_str(&updated).expect("json");
        assert_eq!(parsed.len(), 2);
        assert_eq!(parsed[1]["kind"], "sql");
        assert!(append_sql_migration(&updated, "AddWidget", 99).is_err());
    }
}
