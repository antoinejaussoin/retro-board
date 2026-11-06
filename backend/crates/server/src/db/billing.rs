use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use super::users::user_by_id;
use super::DbResult;

pub async fn start_trial(pool: &PgPool, user_id: &str, force_pro: bool) -> DbResult<bool> {
    let Some(user) = user_by_id(pool, user_id, force_pro).await? else {
        return Ok(false);
    };
    if user.trial.is_some() || user.pro {
        return Ok(false);
    }
    let trial = Utc::now() + Duration::days(30);
    sqlx::query("UPDATE users SET trial = $2 WHERE id = $1 AND trial IS NULL")
        .bind(user_id)
        .bind(trial)
        .execute(pool)
        .await?;
    Ok(true)
}

pub async fn track_user(
    pool: &PgPool,
    user_id: &str,
    campaign: &str,
    creative: &str,
    device: Option<&str>,
    keyword: Option<&str>,
    gclid: Option<&str>,
) -> DbResult<()> {
    sqlx::query(
        r#"UPDATE users SET tracking_campaign_id = $2, tracking_creative_id = $3, tracking_device = $4,
               tracking_keyword = $5, tracking_gclid = $6, tracking_tracked_at = now()
           WHERE id = $1 AND tracking_tracked_at IS NULL"#,
    )
    .bind(user_id)
    .bind(campaign)
    .bind(creative)
    .bind(device)
    .bind(keyword)
    .bind(gclid)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn ai_allowance(
    pool: &PgPool,
    user_id: &str,
    pro: bool,
    free_limit: f64,
    paid_limit: f64,
) -> DbResult<f64> {
    let count: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*) FROM ai_chat_messages m
           JOIN ai_chat c ON c.id = m.chat_id
           WHERE m.role = 'user' AND c.created_by_id = $1 AND c.created >= now() - interval '30 days'"#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;
    let limit = if pro { paid_limit } else { free_limit };
    Ok(count as f64 / limit)
}

pub async fn record_ai(
    pool: &PgPool,
    chat_id: &str,
    user_id: &str,
    role: &str,
    content: &str,
) -> DbResult<()> {
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM ai_chat WHERE id = $1")
        .bind(chat_id)
        .fetch_one(pool)
        .await?;
    if exists == 0 {
        sqlx::query("INSERT INTO ai_chat (id, created_by_id) VALUES ($1, $2)")
            .bind(chat_id)
            .bind(user_id)
            .execute(pool)
            .await?;
    }
    sqlx::query(
        "INSERT INTO ai_chat_messages (id, chat_id, role, content) VALUES ($1, $2, $3, $4)",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(chat_id)
    .bind(role)
    .bind(content)
    .execute(pool)
    .await?;
    Ok(())
}

/// Saved retrospective summary and the fingerprint of the board it describes.
pub struct StoredAiSummary {
    pub summary: Option<String>,
    pub fingerprint: Option<String>,
}

pub async fn stored_ai_summary(
    pool: &PgPool,
    session_id: &str,
) -> DbResult<Option<StoredAiSummary>> {
    let row = sqlx::query_as::<_, (Option<String>, Option<String>)>(
        "SELECT ai_summary, ai_summary_fingerprint FROM sessions WHERE id = $1",
    )
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|(summary, fingerprint)| StoredAiSummary {
        summary,
        fingerprint,
    }))
}

pub async fn save_ai_summary(
    pool: &PgPool,
    session_id: &str,
    summary: &str,
    fingerprint: &str,
) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET ai_summary = $2, ai_summary_fingerprint = $3 WHERE id = $1")
        .bind(session_id)
        .bind(summary)
        .bind(fingerprint)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn cancel_subscription(pool: &PgPool, id: &str) -> DbResult<()> {
    sqlx::query("UPDATE subscriptions SET active = false WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn activate_subscription(
    pool: &PgPool,
    id: &str,
    owner_id: &str,
    plan: &str,
    domain: Option<&str>,
    currency: &str,
) -> DbResult<()> {
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM subscriptions WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await?;
    if exists == 0 {
        sqlx::query("INSERT INTO subscriptions (id, owner_id, plan, domain, active) VALUES ($1,$2,$3,$4,true)")
            .bind(id)
            .bind(owner_id)
            .bind(plan)
            .bind(domain)
            .execute(pool)
            .await?;
    } else {
        sqlx::query("UPDATE subscriptions SET active = true, domain = $2, plan = $3 WHERE id = $1")
            .bind(id)
            .bind(domain)
            .bind(plan)
            .execute(pool)
            .await?;
    }
    sqlx::query("UPDATE users SET currency = $2 WHERE id = $1")
        .bind(owner_id)
        .bind(currency)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn team_members(
    pool: &PgPool,
    user_id: &str,
    email: Option<&str>,
    admins: bool,
) -> DbResult<Option<Vec<String>>> {
    let column = if admins { "admins" } else { "members" };
    let sql = if admins {
        "SELECT members FROM subscriptions WHERE active AND plan = 'team' AND owner_id = $1 ORDER BY updated DESC LIMIT 1"
    } else {
        "SELECT members FROM subscriptions WHERE active AND plan = 'team' AND (owner_id = $1 OR admins @> ARRAY[$2]::text[]) ORDER BY updated DESC LIMIT 1"
    };
    let _ = column;
    let query = sqlx::query_scalar::<_, Vec<String>>(sql).bind(user_id);
    let row = if admins {
        query.fetch_optional(pool).await?
    } else {
        query.bind(email.unwrap_or("")).fetch_optional(pool).await?
    };
    Ok(row)
}

pub async fn set_members(
    pool: &PgPool,
    user_id: &str,
    email: Option<&str>,
    members: &[String],
) -> DbResult<bool> {
    let result = sqlx::query(
        r#"UPDATE subscriptions SET members = $3 WHERE id = (
             SELECT id FROM subscriptions WHERE active AND plan = 'team' AND (owner_id = $1 OR admins @> ARRAY[$2]::text[])
             ORDER BY updated DESC LIMIT 1)"#,
    )
    .bind(user_id)
    .bind(email.unwrap_or(""))
    .bind(members)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn set_admins(pool: &PgPool, user_id: &str, admins: &[String]) -> DbResult<bool> {
    let result = sqlx::query(
        r#"UPDATE subscriptions SET admins = $2 WHERE id = (
             SELECT id FROM subscriptions WHERE active AND plan = 'team' AND owner_id = $1 ORDER BY updated DESC LIMIT 1)"#,
    )
    .bind(user_id)
    .bind(admins)
    .execute(pool)
    .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn register_licence(
    pool: &PgPool,
    email: Option<&str>,
    key: &str,
    customer: &str,
    session: &str,
) -> DbResult<String> {
    sqlx::query(
        r#"INSERT INTO licences (id, email, key, stripe_customer_id, stripe_session_id) VALUES ($1,$2,$3,$4,$5)"#,
    )
    .bind(Uuid::new_v4().to_string())
    .bind(email)
    .bind(key)
    .bind(customer)
    .bind(session)
    .execute(pool)
    .await?;
    Ok(key.to_owned())
}

pub async fn licence_by_key(pool: &PgPool, key: &str) -> DbResult<Option<String>> {
    sqlx::query_scalar("SELECT email FROM licences WHERE key = $1")
        .bind(key)
        .fetch_optional(pool)
        .await
}

pub async fn user_by_email(pool: &PgPool, email: &str) -> DbResult<Option<String>> {
    sqlx::query_scalar("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(pool)
        .await
}
