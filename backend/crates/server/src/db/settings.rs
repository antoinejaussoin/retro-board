use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use super::board::access;
use super::session::insert_columns;
use super::users::user_by_identity;
use super::DbResult;
use crate::models::{ColumnDefinition, SessionMetadata, SessionOptions, User};
use retrospected_migrations::Rank;

pub async fn update_options(
    pool: &PgPool,
    session_id: &str,
    options: &SessionOptions,
) -> DbResult<()> {
    sqlx::query(
        r#"UPDATE sessions SET
            options_max_up_votes = $2, options_max_down_votes = $3, options_max_posts = $4,
            options_allow_actions = $5, options_allow_self_voting = $6, options_allow_multiple_votes = $7,
            options_allow_author_visible = $8, options_allow_giphy = $9, options_allow_grouping = $10,
            options_allow_reordering = $11, options_allow_cancel_vote = $12, options_blur_cards = $13,
            options_new_posts_first = $14, options_allow_timer = $15, options_timer_duration = $16,
            options_readonly_on_timer_end = $17, options_restrict_title_edit_to_moderator = $18,
            options_restrict_reordering_to_moderator = $19, options_restrict_grouping_to_moderator = $20
           WHERE id = $1"#,
    )
    .bind(session_id)
    .bind(options.max_up_votes)
    .bind(options.max_down_votes)
    .bind(options.max_posts)
    .bind(options.allow_actions)
    .bind(options.allow_self_voting)
    .bind(options.allow_multiple_votes)
    .bind(options.allow_author_visible)
    .bind(options.allow_giphy)
    .bind(options.allow_grouping)
    .bind(options.allow_reordering)
    .bind(options.allow_cancel_vote)
    .bind(options.blur_cards)
    .bind(options.new_posts_first)
    .bind(options.allow_timer)
    .bind(options.timer_duration)
    .bind(options.readonly_on_timer_end)
    .bind(options.restrict_title_edit_to_moderator)
    .bind(options.restrict_reordering_to_moderator)
    .bind(options.restrict_grouping_to_moderator)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn replace_columns(
    pool: &PgPool,
    session_id: &str,
    columns: &[ColumnDefinition],
) -> DbResult<()> {
    sqlx::query("DELETE FROM columns WHERE session_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    insert_columns(pool, session_id, columns).await
}

pub async fn rename_session(pool: &PgPool, session_id: &str, name: &str) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET name = $2 WHERE id = $1")
        .bind(session_id)
        .bind(name)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn set_moderator(pool: &PgPool, session_id: &str, moderator_id: &str) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET moderator_id = $2 WHERE id = $1")
        .bind(session_id)
        .bind(moderator_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn set_locked(pool: &PgPool, session_id: &str, locked: bool) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET locked = $2 WHERE id = $1")
        .bind(session_id)
        .bind(locked)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn created_by(pool: &PgPool, session_id: &str, user_id: &str) -> DbResult<bool> {
    let id: Option<String> = sqlx::query_scalar("SELECT created_by_id FROM sessions WHERE id = $1")
        .bind(session_id)
        .fetch_optional(pool)
        .await?;
    Ok(id.as_deref() == Some(user_id))
}

pub async fn toggle_ready(pool: &PgPool, session_id: &str, user_id: &str) -> DbResult<bool> {
    let ready: Vec<String> = sqlx::query_scalar("SELECT ready FROM sessions WHERE id = $1")
        .bind(session_id)
        .fetch_one(pool)
        .await?;
    let next: Vec<String> = if ready.iter().any(|id| id == user_id) {
        ready.into_iter().filter(|id| id != user_id).collect()
    } else {
        let mut ready = ready;
        ready.push(user_id.to_owned());
        ready
    };
    let is_ready = next.iter().any(|id| id == user_id);
    sqlx::query("UPDATE sessions SET ready = $2 WHERE id = $1")
        .bind(session_id)
        .bind(&next)
        .execute(pool)
        .await?;
    Ok(is_ready)
}

pub async fn start_timer(pool: &PgPool, session_id: &str) -> DbResult<f64> {
    let duration: f64 =
        sqlx::query_scalar("SELECT options_timer_duration::float8 FROM sessions WHERE id = $1")
            .bind(session_id)
            .fetch_one(pool)
            .await?;
    let ends = Utc::now() + Duration::seconds(duration as i64);
    sqlx::query("UPDATE sessions SET timer = $2 WHERE id = $1")
        .bind(session_id)
        .bind(ends)
        .execute(pool)
        .await?;
    Ok(duration)
}

pub async fn stop_timer(pool: &PgPool, session_id: &str) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET timer = NULL WHERE id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn save_template(
    pool: &PgPool,
    user_id: &str,
    columns: &[ColumnDefinition],
    options: &SessionOptions,
) -> DbResult<()> {
    let id = Uuid::new_v4().to_string();
    sqlx::query(
        r#"INSERT INTO templates (
            id, name, created_by_id,
            options_max_up_votes, options_max_down_votes, options_max_posts,
            options_allow_actions, options_allow_self_voting, options_allow_multiple_votes,
            options_allow_author_visible, options_allow_giphy, options_allow_grouping,
            options_allow_reordering, options_allow_cancel_vote, options_blur_cards,
            options_new_posts_first, options_allow_timer, options_timer_duration,
            options_readonly_on_timer_end, options_restrict_title_edit_to_moderator,
            options_restrict_reordering_to_moderator, options_restrict_grouping_to_moderator
        ) VALUES ($1,'Default Template',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)"#,
    )
    .bind(&id)
    .bind(user_id)
    .bind(options.max_up_votes)
    .bind(options.max_down_votes)
    .bind(options.max_posts)
    .bind(options.allow_actions)
    .bind(options.allow_self_voting)
    .bind(options.allow_multiple_votes)
    .bind(options.allow_author_visible)
    .bind(options.allow_giphy)
    .bind(options.allow_grouping)
    .bind(options.allow_reordering)
    .bind(options.allow_cancel_vote)
    .bind(options.blur_cards)
    .bind(options.new_posts_first)
    .bind(options.allow_timer)
    .bind(options.timer_duration)
    .bind(options.readonly_on_timer_end)
    .bind(options.restrict_title_edit_to_moderator)
    .bind(options.restrict_reordering_to_moderator)
    .bind(options.restrict_grouping_to_moderator)
    .execute(pool)
    .await?;
    for column in columns {
        let column_id = if column.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            column.id.clone()
        };
        sqlx::query(
            r#"INSERT INTO templates_columns (id, template_id, type, index, label, color, icon) VALUES ($1,$2,$3,$4,$5,$6,$7)"#,
        )
        .bind(column_id)
        .bind(&id)
        .bind(&column.kind)
        .bind(column.index)
        .bind(&column.label)
        .bind(&column.color)
        .bind(&column.icon)
        .execute(pool)
        .await?;
    }
    sqlx::query("UPDATE users SET default_template_id = $2 WHERE id = $1")
        .bind(user_id)
        .bind(&id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn previous_sessions(pool: &PgPool, user_id: &str) -> DbResult<Vec<SessionMetadata>> {
    let rows = sqlx::query_as::<_, (String, Option<String>, DateTime<Utc>, serde_json::Value, Option<String>, bool, i64, i64, i64, serde_json::Value)>(
        r#"SELECT id, name, created, created_by, encrypted, locked, number_of_actions, number_of_posts, number_of_votes, COALESCE(participants, '[]'::json)
           FROM session_view WHERE id IN (
             SELECT sessions_id FROM visitors WHERE users_id = $1
             UNION
             SELECT id FROM sessions WHERE created_by_id = $1
           )"#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .map(|row| {
            let created_by: User = serde_json::from_value(row.3.clone()).unwrap_or(User {
                id: String::new(),
                name: String::new(),
                photo: None,
                email: None,
            });
            let participants: Vec<User> = serde_json::from_value(row.9).unwrap_or_default();
            let locked_for_user = row.5 && !participants.iter().any(|user| user.id == user_id);
            SessionMetadata {
                id: row.0,
                name: row.1,
                created: row.2,
                created_by: created_by.clone(),
                encrypted: row.4,
                locked: row.5,
                number_of_actions: row.6,
                number_of_posts: row.7,
                number_of_votes: row.8,
                participants,
                can_be_deleted: created_by.id == user_id,
                locked_for_user,
            }
        })
        .collect())
}

pub async fn delete_session(
    pool: &PgPool,
    identity_id: &str,
    session_id: &str,
    force_pro: bool,
) -> DbResult<bool> {
    let Some(user) = user_by_identity(pool, identity_id, force_pro).await? else {
        return Ok(false);
    };
    let Some(access) = access(pool, session_id).await? else {
        return Ok(false);
    };
    if access.created_by != user.id || !user.can_delete_session {
        return Ok(false);
    }
    sqlx::query("DELETE FROM messages WHERE session_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM visitors WHERE sessions_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM votes WHERE post_id IN (SELECT id FROM posts WHERE session_id = $1)")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM posts WHERE session_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM columns WHERE session_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM groups WHERE session_id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    sqlx::query("DELETE FROM sessions WHERE id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    Ok(true)
}

pub async fn mark_demo(pool: &PgPool, session_id: &str, options: &SessionOptions) -> DbResult<()> {
    sqlx::query("UPDATE sessions SET name = 'My Retro Demo', demo = true WHERE id = $1")
        .bind(session_id)
        .execute(pool)
        .await?;
    update_options(pool, session_id, options).await
}

pub fn middle_rank() -> String {
    Rank::middle().to_string()
}

pub fn next_rank(rank: &str) -> String {
    Rank::parse(rank)
        .map(|rank| rank.gen_next().to_string())
        .unwrap_or_else(|_| Rank::middle().to_string())
}
