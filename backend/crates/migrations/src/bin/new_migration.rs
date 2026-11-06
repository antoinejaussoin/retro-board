//! Append an empty SQL migration to `data/migrations.json`.
//!
//! Usage: retrospected-new-migration AddWidget

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let Some(title) = std::env::args()
        .nth(1)
        .filter(|title| !title.trim().is_empty())
    else {
        eprintln!("Provide a migration title, for example AddWidget");
        std::process::exit(1);
    };
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("data/migrations.json");
    let catalogue = match std::fs::read_to_string(&path) {
        Ok(catalogue) => catalogue,
        Err(error) => {
            eprintln!("could not read {}: {error}", path.display());
            std::process::exit(1);
        }
    };
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| i64::try_from(duration.as_millis()).unwrap_or(0))
        .unwrap_or(0);
    match retrospected_migrations::append_sql_migration(&catalogue, &title, timestamp) {
        Ok(updated) => {
            if let Err(error) = std::fs::write(&path, updated) {
                eprintln!("could not write {}: {error}", path.display());
                std::process::exit(1);
            }
            println!(
                "Added {title}{timestamp}. Fill in its sql in {} before starting the server.",
                path.display()
            );
        }
        Err(error) => {
            eprintln!("{error}");
            std::process::exit(1);
        }
    }
}
