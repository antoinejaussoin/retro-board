use chrono::{DateTime, Utc};
use sqlx::PgPool;

use super::DbResult;
use crate::models::{
    Board, ColumnDefinition, FullUser, Message, Post, PostGroup, SessionOptions, User, VoteExtract,
};

type OptRow = (
    Option<f64>,
    Option<f64>,
    Option<f64>,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    bool,
    f64,
    bool,
    bool,
    bool,
    bool,
);

pub(crate) fn options_from_tuple(row: OptRow) -> SessionOptions {
    SessionOptions {
        max_up_votes: row.0,
        max_down_votes: row.1,
        max_posts: row.2,
        allow_actions: row.3,
        allow_self_voting: row.4,
        allow_multiple_votes: row.5,
        allow_author_visible: row.6,
        allow_giphy: row.7,
        allow_grouping: row.8,
        allow_reordering: row.9,
        allow_cancel_vote: row.10,
        blur_cards: row.11,
        new_posts_first: row.12,
        allow_timer: row.13,
        timer_duration: row.14,
        readonly_on_timer_end: row.15,
        restrict_title_edit_to_moderator: row.16,
        restrict_reordering_to_moderator: row.17,
        restrict_grouping_to_moderator: row.18,
    }
}

#[derive(sqlx::FromRow)]
struct BoardHead {
    id: String,
    name: Option<String>,
    encrypted: Option<String>,
    locked: bool,
    demo: bool,
    ready: Vec<String>,
    timer: Option<DateTime<Utc>>,
    max_up_votes: Option<f64>,
    max_down_votes: Option<f64>,
    max_posts: Option<f64>,
    allow_actions: bool,
    allow_self_voting: bool,
    allow_multiple_votes: bool,
    allow_author_visible: bool,
    allow_giphy: bool,
    allow_grouping: bool,
    allow_reordering: bool,
    allow_cancel_vote: bool,
    blur_cards: bool,
    new_posts_first: bool,
    allow_timer: bool,
    timer_duration: f64,
    readonly_on_timer_end: bool,
    restrict_title: bool,
    restrict_reorder: bool,
    restrict_group: bool,
    created_id: String,
    created_name: String,
    created_photo: Option<String>,
    created_email: Option<String>,
    moderator_id: String,
    moderator_name: String,
    moderator_photo: Option<String>,
    moderator_email: Option<String>,
}

pub async fn load_board(pool: &PgPool, session_id: &str) -> DbResult<Option<Board>> {
    let session = sqlx::query_as::<_, BoardHead>(
        r#"SELECT s.id, s.name, s.encrypted, s.locked, s.demo, s.ready, s.timer,
                  s.options_max_up_votes::float8 AS max_up_votes,
                  s.options_max_down_votes::float8 AS max_down_votes,
                  s.options_max_posts::float8 AS max_posts,
                  s.options_allow_actions AS allow_actions,
                  s.options_allow_self_voting AS allow_self_voting,
                  s.options_allow_multiple_votes AS allow_multiple_votes,
                  s.options_allow_author_visible AS allow_author_visible,
                  s.options_allow_giphy AS allow_giphy,
                  s.options_allow_grouping AS allow_grouping,
                  s.options_allow_reordering AS allow_reordering,
                  s.options_allow_cancel_vote AS allow_cancel_vote,
                  s.options_blur_cards AS blur_cards,
                  s.options_new_posts_first AS new_posts_first,
                  s.options_allow_timer AS allow_timer,
                  s.options_timer_duration::float8 AS timer_duration,
                  s.options_readonly_on_timer_end AS readonly_on_timer_end,
                  s.options_restrict_title_edit_to_moderator AS restrict_title,
                  s.options_restrict_reordering_to_moderator AS restrict_reorder,
                  s.options_restrict_grouping_to_moderator AS restrict_group,
                  cu.id AS created_id, cu.name AS created_name, cu.photo AS created_photo, cu.email AS created_email,
                  mu.id AS moderator_id, mu.name AS moderator_name, mu.photo AS moderator_photo, mu.email AS moderator_email
           FROM sessions s
           JOIN users cu ON cu.id = s.created_by_id
           JOIN users mu ON mu.id = s.moderator_id
           WHERE s.id = $1"#,
    )
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    let Some(row) = session else {
        return Ok(None);
    };
    let columns = sqlx::query_as::<_, (String, String, i32, String, String, Option<String>)>(
        "SELECT id, type, index, label, color, icon FROM columns WHERE session_id = $1 ORDER BY index",
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|col| ColumnDefinition { id: col.0, kind: col.1, index: col.2, label: col.3, color: col.4, icon: col.5 })
    .collect();
    let posts = load_posts(pool, session_id).await?;
    let groups = load_groups(pool, session_id).await?;
    let messages = load_messages(pool, session_id).await?;
    let options = options_from_tuple((
        row.max_up_votes,
        row.max_down_votes,
        row.max_posts,
        row.allow_actions,
        row.allow_self_voting,
        row.allow_multiple_votes,
        row.allow_author_visible,
        row.allow_giphy,
        row.allow_grouping,
        row.allow_reordering,
        row.allow_cancel_vote,
        row.blur_cards,
        row.new_posts_first,
        row.allow_timer,
        row.timer_duration,
        row.readonly_on_timer_end,
        row.restrict_title,
        row.restrict_reorder,
        row.restrict_group,
    ));
    Ok(Some(Board {
        id: row.id,
        name: row.name,
        encrypted: row.encrypted,
        locked: row.locked,
        demo: row.demo,
        ready: row.ready,
        timer: row.timer,
        created_by: User {
            id: row.created_id,
            name: row.created_name,
            photo: row.created_photo,
            email: row.created_email,
        },
        moderator: User {
            id: row.moderator_id,
            name: row.moderator_name,
            photo: row.moderator_photo,
            email: row.moderator_email,
        },
        columns,
        posts,
        groups,
        messages,
        options,
    }))
}

async fn load_posts(pool: &PgPool, session_id: &str) -> DbResult<Vec<Post>> {
    let rows = sqlx::query_as::<
        _,
        (
            String,
            i32,
            String,
            Option<String>,
            Option<String>,
            String,
            String,
            String,
            Option<String>,
            Option<String>,
            Option<String>,
            Option<String>,
            Option<i32>,
            Option<String>,
        ),
    >(
        r#"SELECT p.id, p."column", p.content, p.action, p.giphy, p.rank,
                  u.id, u.name, u.photo, u.email,
                  g.id, g.label, g."column", g.rank
           FROM posts p
           JOIN users u ON u.id = p.user_id
           LEFT JOIN groups g ON g.id = p.group_id
           WHERE p.session_id = $1
           ORDER BY p.created ASC"#,
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;
    let mut posts = Vec::new();
    for row in rows {
        let votes = sqlx::query_as::<_, (String, String, String, String)>(
            r#"SELECT v.id, v.type, u.id, u.name FROM votes v JOIN users u ON u.id = v.user_id WHERE v.post_id = $1"#,
        )
        .bind(&row.0)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|vote| VoteExtract { id: vote.0, kind: vote.1, user_id: vote.2, user_name: vote.3 })
        .collect();
        let group = match (row.10, row.11, row.12, row.13) {
            (Some(id), Some(label), Some(column), Some(rank)) => Some(PostGroup {
                id,
                label,
                column,
                rank,
                posts: Vec::new(),
                user: User {
                    id: row.6.clone(),
                    name: row.7.clone(),
                    photo: row.8.clone(),
                    email: row.9.clone(),
                },
            }),
            _ => None,
        };
        posts.push(Post {
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
        });
    }
    Ok(posts)
}

async fn load_groups(pool: &PgPool, session_id: &str) -> DbResult<Vec<PostGroup>> {
    let rows = sqlx::query_as::<
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
           FROM groups g JOIN users u ON u.id = g.user_id
           WHERE g.session_id = $1 ORDER BY g.created ASC"#,
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .map(|row| PostGroup {
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
        })
        .collect())
}

async fn load_messages(pool: &PgPool, session_id: &str) -> DbResult<Vec<Message>> {
    let rows = sqlx::query_as::<
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
           FROM messages m JOIN users u ON u.id = m.user_id
           WHERE m.session_id = $1 ORDER BY m.created DESC"#,
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .map(|row| Message {
            id: row.0,
            content: row.1,
            created: row.2,
            user: User {
                id: row.3,
                name: row.4,
                photo: row.5,
                email: row.6,
            },
        })
        .collect())
}

pub async fn session_exists(pool: &PgPool, session_id: &str) -> DbResult<bool> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sessions WHERE id = $1")
        .bind(session_id)
        .fetch_one(pool)
        .await?;
    Ok(count == 1)
}

pub struct Access {
    pub locked: bool,
    pub encrypted: Option<String>,
    pub visitor_ids: Vec<String>,
    pub created_by: String,
}

pub async fn access(pool: &PgPool, session_id: &str) -> DbResult<Option<Access>> {
    let row = sqlx::query_as::<_, (bool, Option<String>, String)>(
        "SELECT locked, encrypted, created_by_id FROM sessions WHERE id = $1",
    )
    .bind(session_id)
    .fetch_optional(pool)
    .await?;
    let Some(row) = row else {
        return Ok(None);
    };
    let visitors =
        sqlx::query_scalar::<_, String>("SELECT users_id FROM visitors WHERE sessions_id = $1")
            .bind(session_id)
            .fetch_all(pool)
            .await?;
    Ok(Some(Access {
        locked: row.0,
        encrypted: row.1,
        created_by: row.2,
        visitor_ids: visitors,
    }))
}

pub fn allowed(
    access: &Access,
    user: Option<&FullUser>,
    force_pro: bool,
) -> Result<(), &'static str> {
    let pro = user.is_some_and(|user| {
        user.pro || force_pro || user.trial.is_some_and(|trial| trial > Utc::now())
    });
    if (access.locked || access.encrypted.is_some()) && user.is_some() && !pro {
        return Err("non_pro");
    }
    if access.locked {
        let Some(user) = user else {
            return Err("locked");
        };
        if pro && access.visitor_ids.iter().any(|id| id == &user.id) {
            return Ok(());
        }
        if pro {
            return Err("locked");
        }
    }
    Ok(())
}
