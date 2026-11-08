use sqlx::PgPool;
use uuid::Uuid;

use super::users::{register_anonymous, user_by_identity};
use super::DbResult;
use crate::models::FullUser;

pub async fn user_id_by_slack(pool: &PgPool, slack_user_id: &str) -> DbResult<Option<String>> {
    sqlx::query_scalar("SELECT id FROM users WHERE slack_user_id = $1 LIMIT 1")
        .bind(slack_user_id)
        .fetch_optional(pool)
        .await
}

pub async fn delete_account(
    pool: &PgPool,
    user: &FullUser,
    delete_sessions: bool,
    delete_posts: bool,
    delete_votes: bool,
) -> DbResult<bool> {
    let anon_name = format!("(deleted user)^{}", Uuid::new_v4());
    let anon_hash = crate::crypto::hash_password(&Uuid::new_v4().to_string())
        .map_err(|error| sqlx::Error::Protocol(error.to_string()))?;
    let anon = register_anonymous(pool, &anon_name, &anon_hash)
        .await?
        .ok_or(sqlx::Error::RowNotFound)?;
    let anon_user = anon.user_id;
    let mut tx = pool.begin().await?;
    if delete_sessions {
        sqlx::query("DELETE FROM messages WHERE user_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("DELETE FROM visitors WHERE users_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE messages SET user_id = $1 WHERE user_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("UPDATE visitors SET users_id = $1 WHERE users_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    }
    if delete_posts {
        sqlx::query("DELETE FROM ai_chat WHERE created_by_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE ai_chat SET created_by_id = $1 WHERE created_by_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    }
    if delete_votes {
        sqlx::query("DELETE FROM votes WHERE user_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("DELETE FROM post_reactions WHERE user_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE votes SET user_id = $1 WHERE user_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("UPDATE post_reactions SET user_id = $1 WHERE user_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    }
    if delete_posts {
        sqlx::query("DELETE FROM votes WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query(
            "DELETE FROM post_reactions WHERE post_id IN (SELECT id FROM posts WHERE user_id = $1)",
        )
        .bind(&user.id)
        .execute(&mut *tx)
        .await?;
        sqlx::query("UPDATE posts SET group_id = NULL WHERE group_id IN (SELECT id FROM groups WHERE user_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM posts WHERE user_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("DELETE FROM groups WHERE user_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE posts SET user_id = $1 WHERE user_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("UPDATE groups SET user_id = $1 WHERE user_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    }
    if delete_sessions {
        sqlx::query("DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM votes WHERE post_id IN (SELECT id FROM posts WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1))").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM post_reactions WHERE post_id IN (SELECT id FROM posts WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1))").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM posts WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM groups WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM columns WHERE session_id IN (SELECT id FROM sessions WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM visitors WHERE sessions_id IN (SELECT id FROM sessions WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
        sqlx::query("DELETE FROM sessions WHERE created_by_id = $1")
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE sessions SET created_by_id = $1 WHERE created_by_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("UPDATE sessions SET moderator_id = $1 WHERE moderator_id = $2")
            .bind(&anon_user)
            .bind(&user.id)
            .execute(&mut *tx)
            .await?;
    }
    sqlx::query("UPDATE users SET default_template_id = NULL WHERE default_template_id IN (SELECT id FROM templates WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM templates_columns WHERE template_id IN (SELECT id FROM templates WHERE created_by_id = $1)").bind(&user.id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM templates WHERE created_by_id = $1")
        .bind(&user.id)
        .execute(&mut *tx)
        .await?;
    sqlx::query("DELETE FROM subscriptions WHERE owner_id = $1")
        .bind(&user.id)
        .execute(&mut *tx)
        .await?;
    sqlx::query("DELETE FROM users_identities WHERE user_id = $1")
        .bind(&user.id)
        .execute(&mut *tx)
        .await?;
    sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(&user.id)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(true)
}

pub async fn merge_users(
    pool: &PgPool,
    main_identity: &str,
    targets: &[String],
    force_pro: bool,
) -> DbResult<bool> {
    let Some(main) = user_by_identity(pool, main_identity, force_pro).await? else {
        return Ok(false);
    };
    for target_identity in targets {
        let Some(target) = user_by_identity(pool, target_identity, force_pro).await? else {
            continue;
        };
        if target.id == main.id {
            continue;
        }
        sqlx::query("UPDATE messages SET user_id = $1 WHERE user_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query(
            r#"UPDATE visitors SET users_id = $1 WHERE users_id = $2
               AND NOT EXISTS (SELECT 1 FROM visitors v WHERE v.sessions_id = visitors.sessions_id AND v.users_id = $1)"#,
        )
        .bind(&main.id)
        .bind(&target.id)
        .execute(pool)
        .await?;
        sqlx::query("UPDATE ai_chat SET created_by_id = $1 WHERE created_by_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE votes SET user_id = $1 WHERE user_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE post_reactions SET user_id = $1 WHERE user_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE posts SET user_id = $1 WHERE user_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE groups SET user_id = $1 WHERE user_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE sessions SET created_by_id = $1 WHERE created_by_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        sqlx::query("UPDATE sessions SET moderator_id = $1 WHERE moderator_id = $2")
            .bind(&main.id)
            .bind(&target.id)
            .execute(pool)
            .await?;
        let _ = delete_account(pool, &target, true, true, true).await;
    }
    Ok(true)
}
