//! Migrations whose TypeORM `up` methods are not a straight list of SQL strings.

use sqlx::Postgres;

use crate::lexorank::Rank;
use crate::Step;

pub async fn initial(
    tx: &mut sqlx::Transaction<'_, Postgres>,
    steps: &[Step],
) -> Result<(), sqlx::Error> {
    let exists = sqlx::query_scalar::<_, bool>(
        r#"SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'sessions'
        )"#,
    )
    .fetch_one(&mut **tx)
    .await?;
    if exists {
        tracing::info!("sessions already exists; Initial migration records itself without DDL");
        return Ok(());
    }
    for step in steps {
        crate::execute_step(tx, step).await?;
    }
    Ok(())
}

pub async fn rerank(tx: &mut sqlx::Transaction<'_, Postgres>) -> Result<(), sqlx::Error> {
    let sessions = sqlx::query_scalar::<_, String>(r#"SELECT id FROM sessions"#)
        .fetch_all(&mut **tx)
        .await?;
    for session_id in sessions {
        let posts = sqlx::query_scalar::<_, String>(
            r#"SELECT "id" FROM posts WHERE "sessionId" = $1 ORDER BY "created""#,
        )
        .bind(&session_id)
        .fetch_all(&mut **tx)
        .await?;
        let mut current = Rank::middle();
        for post_id in posts {
            sqlx::query(r#"UPDATE posts SET "rank" = $1 WHERE "id" = $2"#)
                .bind(current.to_string())
                .bind(&post_id)
                .execute(&mut **tx)
                .await?;
            current = current.gen_next();
        }
    }
    Ok(())
}

pub async fn identities(tx: &mut sqlx::Transaction<'_, Postgres>) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"insert into users_identities
            select uuid_in(md5(random()::text || clock_timestamp()::text)::cstring),
                   "accountType", "username", "password", "emailVerification",
                   "created", "updated", "id", "photo"
            from users"#,
    )
    .execute(&mut **tx)
    .await?;

    let duplicates = sqlx::query_as::<_, (String, Vec<String>)>(
        r#"select sub.email, array(select id from users where email = sub.email) as ids
           from (
             select count(*) as cnt, email from users group by email
           ) as sub
           where sub.cnt > 1 and email is not null"#,
    )
    .fetch_all(&mut **tx)
    .await?;

    const TABLES: &[(&str, &str)] = &[
        ("groups", "userId"),
        ("posts", "userId"),
        ("sessions", "createdById"),
        ("subscriptions", "ownerId"),
        ("templates", "createdById"),
        ("votes", "userId"),
        ("users_identities", "userId"),
    ];
    const FIELDS: &[&str] = &["stripeId", "currency", "defaultTemplateId", "trial"];

    for (email_index, (email, ids)) in duplicates.iter().enumerate() {
        tracing::info!(
            email,
            progress = email_index + 1,
            total = duplicates.len(),
            "merging duplicate emails"
        );
        if ids.is_empty() {
            continue;
        }
        let main_id = &ids[0];
        let rows = sqlx::query_as::<_, UserRow>(
            r#"select id, "stripeId", currency, "defaultTemplateId", trial from users where id = ANY($1)"#,
        )
        .bind(ids)
        .fetch_all(&mut **tx)
        .await?;

        for field in FIELDS {
            let value = field_value(&rows, field);
            if let Some(value) = value {
                let sql = format!(r#"update users set "{field}" = $1 where id = $2"#);
                sqlx::query(&sql)
                    .bind(value)
                    .bind(main_id)
                    .execute(&mut **tx)
                    .await?;
            }
        }

        for other_id in ids.iter().skip(1) {
            for (table, column) in TABLES {
                let sql = format!(r#"update {table} set "{column}" = $1 where "{column}" = $2"#);
                // A failed statement aborts a Postgres transaction. Savepoints keep the
                // original "ignore this update" behaviour working for the rest of the merge.
                sqlx::query("SAVEPOINT identity_update")
                    .execute(&mut **tx)
                    .await?;
                if let Err(error) = sqlx::query(&sql)
                    .bind(main_id)
                    .bind(other_id)
                    .execute(&mut **tx)
                    .await
                {
                    tracing::info!(%error, table, "ignoring identity migration update error");
                    sqlx::query("ROLLBACK TO SAVEPOINT identity_update")
                        .execute(&mut **tx)
                        .await?;
                }
                sqlx::query("RELEASE SAVEPOINT identity_update")
                    .execute(&mut **tx)
                    .await?;
            }
            let session_ids = sqlx::query_scalar::<_, String>(
                r#"select "sessionsId" from visitors where "usersId" = $1"#,
            )
            .bind(other_id)
            .fetch_all(&mut **tx)
            .await?;
            for session_id in session_ids {
                sqlx::query(
                    r#"insert into visitors ("sessionsId", "usersId") values ($1, $2) on conflict do nothing"#,
                )
                .bind(&session_id)
                .bind(main_id)
                .execute(&mut **tx)
                .await?;
            }
            sqlx::query(r#"delete from visitors where "usersId" = $1"#)
                .bind(other_id)
                .execute(&mut **tx)
                .await?;
            sqlx::query(r#"delete from users where id = $1"#)
                .bind(other_id)
                .execute(&mut **tx)
                .await?;
        }
    }
    Ok(())
}

#[derive(sqlx::FromRow)]
struct UserRow {
    #[allow(dead_code)]
    id: String,
    #[sqlx(rename = "stripeId")]
    stripe_id: Option<String>,
    currency: Option<String>,
    #[sqlx(rename = "defaultTemplateId")]
    default_template_id: Option<String>,
    trial: Option<chrono::DateTime<chrono::Utc>>,
}

fn field_value(rows: &[UserRow], field: &str) -> Option<String> {
    for row in rows {
        let value = match field {
            "stripeId" => row.stripe_id.clone(),
            "currency" => row.currency.clone(),
            "defaultTemplateId" => row.default_template_id.clone(),
            "trial" => row.trial.map(|value| value.to_rfc3339()),
            _ => None,
        };
        if value.is_some() {
            return value;
        }
    }
    None
}
