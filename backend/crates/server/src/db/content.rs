use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use super::board::session_exists;
use super::DbResult;
use crate::models::{Message, Post, PostGroup, ReactionExtract, User, VoteExtract};

/// Soft upper bound for a single emoji / ZWJ sequence stored as UTF-8.
const MAX_REACTION_BYTES: usize = 32;

/// Whether `emoji` is a plausible single reaction glyph (any emoji, not a fixed palette).
#[must_use]
pub fn is_allowed_reaction(emoji: &str) -> bool {
    let trimmed = emoji.trim();
    if trimmed.is_empty() || trimmed.len() > MAX_REACTION_BYTES {
        return false;
    }
    !trimmed.chars().any(char::is_whitespace)
}

/// Result of toggling a reaction on a post.
#[derive(Debug, Clone)]
pub enum ReactionChange {
    Added(ReactionExtract),
    Removed(ReactionExtract),
}

pub async fn save_post(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    id: &str,
    content: &str,
    column: i32,
    action: Option<&str>,
    giphy: Option<&str>,
    rank: &str,
    group_id: Option<&str>,
) -> DbResult<Option<Post>> {
    if !session_exists(pool, session_id).await? {
        return Ok(None);
    }
    sqlx::query(
        r#"INSERT INTO posts (id, session_id, user_id, "column", content, action, giphy, rank, group_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, "column" = EXCLUDED."column",
             action = EXCLUDED.action, giphy = EXCLUDED.giphy, rank = EXCLUDED.rank, group_id = EXCLUDED.group_id"#,
    )
    .bind(id)
    .bind(session_id)
    .bind(user_id)
    .bind(column)
    .bind(content)
    .bind(action)
    .bind(giphy)
    .bind(rank)
    .bind(group_id)
    .execute(pool)
    .await?;
    post_by_id(pool, id).await
}

pub async fn update_post(
    pool: &PgPool,
    session_id: &str,
    id: &str,
    content: &str,
    column: i32,
    action: Option<&str>,
    giphy: Option<&str>,
    rank: &str,
    group_id: Option<&str>,
) -> DbResult<Option<Post>> {
    let result = sqlx::query(
        r#"UPDATE posts SET content = $3, "column" = $4, action = $5, giphy = $6, rank = $7, group_id = $8
           WHERE id = $1 AND session_id = $2"#,
    )
    .bind(id)
    .bind(session_id)
    .bind(content)
    .bind(column)
    .bind(action)
    .bind(giphy)
    .bind(rank)
    .bind(group_id)
    .execute(pool)
    .await?;
    if result.rows_affected() == 0 {
        return Ok(None);
    }
    post_by_id(pool, id).await
}

async fn post_by_id(pool: &PgPool, id: &str) -> DbResult<Option<Post>> {
    let row = sqlx::query_as::<_, (String, i32, String, Option<String>, Option<String>, String, String, String, Option<String>, Option<String>)>(
        r#"SELECT p.id, p."column", p.content, p.action, p.giphy, p.rank, u.id, u.name, u.photo, u.email
           FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    let Some(row) = row else {
        return Ok(None);
    };
    let votes = sqlx::query_as::<_, (String, String, String, String)>(
        r#"SELECT v.id, v.type, u.id, u.name FROM votes v JOIN users u ON u.id = v.user_id WHERE v.post_id = $1"#,
    )
    .bind(id)
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|vote| VoteExtract { id: vote.0, kind: vote.1, user_id: vote.2, user_name: vote.3 })
    .collect();
    let reactions = sqlx::query_as::<_, (String, String, String, String)>(
        r#"SELECT r.id, r.emoji, u.id, u.name
           FROM post_reactions r JOIN users u ON u.id = r.user_id
           WHERE r.post_id = $1
           ORDER BY r.created ASC"#,
    )
    .bind(id)
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|reaction| ReactionExtract {
        id: reaction.0,
        emoji: reaction.1,
        user_id: reaction.2,
        user_name: reaction.3,
    })
    .collect();
    let group = sqlx::query_as::<_, (String, String, i32, String, String, String, Option<String>, Option<String>)>(
        r#"SELECT g.id, g.label, g."column", g.rank, u.id, u.name, u.photo, u.email
           FROM posts p JOIN groups g ON g.id = p.group_id JOIN users u ON u.id = g.user_id WHERE p.id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .map(|group| PostGroup {
        id: group.0,
        label: group.1,
        column: group.2,
        rank: group.3,
        user: User { id: group.4, name: group.5, photo: group.6, email: group.7 },
        posts: Vec::new(),
    });
    Ok(Some(Post {
        id: row.0,
        column: row.1,
        content: row.2,
        action: row.3,
        giphy: row.4,
        rank: row.5,
        user: User {
            id: row.6,
            name: row.7,
            photo: row.8,
            email: row.9,
        },
        group,
        votes,
        reactions,
    }))
}

pub async fn delete_post(pool: &PgPool, user_id: &str, post_id: &str) -> DbResult<bool> {
    let result = sqlx::query("DELETE FROM posts WHERE id = $1 AND user_id = $2")
        .bind(post_id)
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn save_group(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    id: &str,
    label: &str,
    column: i32,
    rank: &str,
) -> DbResult<Option<PostGroup>> {
    sqlx::query(
        r#"INSERT INTO groups (id, session_id, user_id, "column", label, rank) VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, "column" = EXCLUDED."column", rank = EXCLUDED.rank
           WHERE groups.session_id = EXCLUDED.session_id"#,
    )
    .bind(id)
    .bind(session_id)
    .bind(user_id)
    .bind(column)
    .bind(label)
    .bind(rank)
    .execute(pool)
    .await?;
    group_by_id(pool, id).await
}

async fn group_by_id(pool: &PgPool, id: &str) -> DbResult<Option<PostGroup>> {
    let row = sqlx::query_as::<
        _,
        (
            String,
            i32,
            String,
            String,
            String,
            String,
            Option<String>,
            Option<String>,
        ),
    >(
        r#"SELECT g.id, g."column", g.label, g.rank, u.id, u.name, u.photo, u.email
           FROM groups g JOIN users u ON u.id = g.user_id WHERE g.id = $1"#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|row| PostGroup {
        id: row.0,
        column: row.1,
        label: row.2,
        rank: row.3,
        user: User {
            id: row.4,
            name: row.5,
            photo: row.6,
            email: row.7,
        },
        posts: Vec::new(),
    }))
}

pub async fn delete_group(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    group_id: &str,
) -> DbResult<bool> {
    let visitor: Option<(i32,)> =
        sqlx::query_as("SELECT 1 FROM visitors WHERE sessions_id = $1 AND users_id = $2")
            .bind(session_id)
            .bind(user_id)
            .fetch_optional(pool)
            .await?;
    if visitor.is_none() {
        return Ok(false);
    }
    let result = sqlx::query("DELETE FROM groups WHERE id = $1 AND session_id = $2")
        .bind(group_id)
        .bind(session_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn register_vote(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    post_id: &str,
    kind: &str,
) -> DbResult<Option<VoteExtract>> {
    let allowed: Option<(bool,)> = sqlx::query_as(
        r#"SELECT s.options_allow_multiple_votes FROM posts p JOIN sessions s ON s.id = p.session_id WHERE p.id = $1 AND p.session_id = $2"#,
    )
    .bind(post_id)
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    let Some((multiple,)) = allowed else {
        return Ok(None);
    };
    if !multiple {
        let existing: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM votes WHERE post_id = $1 AND user_id = $2 AND type = $3",
        )
        .bind(post_id)
        .bind(user_id)
        .bind(kind)
        .fetch_one(pool)
        .await?;
        if existing > 0 {
            return Ok(None);
        }
    }
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO votes (id, post_id, user_id, type) VALUES ($1,$2,$3,$4)")
        .bind(&id)
        .bind(post_id)
        .bind(user_id)
        .bind(kind)
        .execute(pool)
        .await?;
    let name: String = sqlx::query_scalar("SELECT name FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(Some(VoteExtract {
        id,
        kind: kind.to_owned(),
        user_id: user_id.to_owned(),
        user_name: name,
    }))
}

pub async fn cancel_votes(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    post_id: &str,
) -> DbResult<()> {
    let allow: Option<bool> =
        sqlx::query_scalar("SELECT options_allow_cancel_vote FROM sessions WHERE id = $1")
            .bind(session_id)
            .fetch_optional(pool)
            .await?;
    if allow == Some(true) {
        sqlx::query("DELETE FROM votes WHERE user_id = $1 AND post_id = $2")
            .bind(user_id)
            .bind(post_id)
            .execute(pool)
            .await?;
    }
    Ok(())
}

/// Toggle a reaction for `user_id` on `post_id` within `session_id`.
pub async fn toggle_reaction(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    post_id: &str,
    emoji: &str,
) -> DbResult<Option<ReactionChange>> {
    if !is_allowed_reaction(emoji) {
        return Ok(None);
    }
    let allowed: Option<(bool, bool)> = sqlx::query_as(
        r#"SELECT s.options_allow_reactions, s.locked
           FROM posts p
           JOIN sessions s ON s.id = p.session_id
           WHERE p.id = $1 AND p.session_id = $2"#,
    )
    .bind(post_id)
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    let Some((allow_reactions, locked)) = allowed else {
        return Ok(None);
    };
    if !allow_reactions || locked {
        return Ok(None);
    }
    let existing: Option<(String, String)> = sqlx::query_as(
        r#"SELECT r.id, u.name
           FROM post_reactions r
           JOIN users u ON u.id = r.user_id
           WHERE r.post_id = $1 AND r.user_id = $2 AND r.emoji = $3"#,
    )
    .bind(post_id)
    .bind(user_id)
    .bind(emoji)
    .fetch_optional(pool)
    .await?;
    if let Some((id, user_name)) = existing {
        sqlx::query("DELETE FROM post_reactions WHERE id = $1")
            .bind(&id)
            .execute(pool)
            .await?;
        return Ok(Some(ReactionChange::Removed(ReactionExtract {
            id,
            emoji: emoji.to_owned(),
            user_id: user_id.to_owned(),
            user_name,
        })));
    }
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO post_reactions (id, post_id, user_id, emoji) VALUES ($1,$2,$3,$4)")
        .bind(&id)
        .bind(post_id)
        .bind(user_id)
        .bind(emoji)
        .execute(pool)
        .await?;
    let user_name: String = sqlx::query_scalar("SELECT name FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(Some(ReactionChange::Added(ReactionExtract {
        id,
        emoji: emoji.to_owned(),
        user_id: user_id.to_owned(),
        user_name,
    })))
}

pub async fn save_message(
    pool: &PgPool,
    user_id: &str,
    session_id: &str,
    id: &str,
    content: &str,
) -> DbResult<Option<Message>> {
    if !session_exists(pool, session_id).await? {
        return Ok(None);
    }
    sqlx::query("INSERT INTO messages (id, session_id, user_id, content) VALUES ($1,$2,$3,$4)")
        .bind(id)
        .bind(session_id)
        .bind(user_id)
        .bind(content)
        .execute(pool)
        .await?;
    let row = sqlx::query_as::<
        _,
        (
            String,
            String,
            DateTime<Utc>,
            String,
            String,
            Option<String>,
            Option<String>,
        ),
    >(
        r#"SELECT m.id, m.content, m.created, u.id, u.name, u.photo, u.email
           FROM messages m JOIN users u ON u.id = m.user_id WHERE m.id = $1"#,
    )
    .bind(id)
    .fetch_one(pool)
    .await?;
    Ok(Some(Message {
        id: row.0,
        content: row.1,
        created: row.2,
        user: User {
            id: row.3,
            name: row.4,
            photo: row.5,
            email: row.6,
        },
    }))
}

#[cfg(test)]
mod reaction_tests {
    use super::is_allowed_reaction;

    #[test]
    fn accepts_common_emoji_and_rejects_empty_or_whitespace() {
        for emoji in ["👍", "❤️", "😄", "🎉", "🚀", "👀", "🔥", "👩‍💻"] {
            assert!(is_allowed_reaction(emoji), "{emoji}");
        }
        assert!(!is_allowed_reaction(""));
        assert!(!is_allowed_reaction("   "));
        assert!(!is_allowed_reaction("thumbs up"));
        assert!(!is_allowed_reaction(&"😀".repeat(20)));
    }
}
