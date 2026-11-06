use sqlx::PgPool;
use uuid::Uuid;

use super::board::{load_board, options_from_tuple};
use super::DbResult;
use crate::models::{Board, ColumnDefinition, SessionOptions};

fn short_id() -> String {
    use rand::Rng;
    const ALPHABET: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
    let mut rng = rand::thread_rng();
    (0..9)
        .map(|_| ALPHABET[rng.gen_range(0..ALPHABET.len())] as char)
        .collect()
}

#[derive(sqlx::FromRow)]
struct OptionsRow {
    id: String,
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
}

pub async fn create_session(
    pool: &PgPool,
    author_id: &str,
    encrypted: Option<&str>,
) -> DbResult<Board> {
    let template = sqlx::query_as::<_, OptionsRow>(
        r#"SELECT t.id,
                  t.options_max_up_votes::float8 AS max_up_votes,
                  t.options_max_down_votes::float8 AS max_down_votes,
                  t.options_max_posts::float8 AS max_posts,
                  t.options_allow_actions AS allow_actions,
                  t.options_allow_self_voting AS allow_self_voting,
                  t.options_allow_multiple_votes AS allow_multiple_votes,
                  t.options_allow_author_visible AS allow_author_visible,
                  t.options_allow_giphy AS allow_giphy,
                  t.options_allow_grouping AS allow_grouping,
                  t.options_allow_reordering AS allow_reordering,
                  t.options_allow_cancel_vote AS allow_cancel_vote,
                  t.options_blur_cards AS blur_cards,
                  t.options_new_posts_first AS new_posts_first,
                  t.options_allow_timer AS allow_timer,
                  t.options_timer_duration::float8 AS timer_duration,
                  t.options_readonly_on_timer_end AS readonly_on_timer_end,
                  t.options_restrict_title_edit_to_moderator AS restrict_title,
                  t.options_restrict_reordering_to_moderator AS restrict_reorder,
                  t.options_restrict_grouping_to_moderator AS restrict_group
           FROM users u JOIN templates t ON t.id = u.default_template_id WHERE u.id = $1"#,
    )
    .bind(author_id)
    .fetch_optional(pool)
    .await?;

    let (options, columns) = if let Some(row) = template {
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
        let cols = sqlx::query_as::<_, (String, String, i32, String, String, Option<String>)>(
            r#"SELECT id, type, index, label, color, icon FROM templates_columns WHERE template_id = $1 ORDER BY index"#,
        )
        .bind(&row.id)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|col| ColumnDefinition {
            id: Uuid::new_v4().to_string(),
            kind: col.1,
            index: col.2,
            label: col.3,
            color: col.4,
            icon: col.5,
        })
        .collect();
        (options, cols)
    } else {
        (
            SessionOptions::default(),
            vec![
                ColumnDefinition {
                    id: Uuid::new_v4().to_string(),
                    kind: "well".into(),
                    index: 0,
                    label: String::new(),
                    color: String::new(),
                    icon: None,
                },
                ColumnDefinition {
                    id: Uuid::new_v4().to_string(),
                    kind: "notWell".into(),
                    index: 1,
                    label: String::new(),
                    color: String::new(),
                    icon: None,
                },
                ColumnDefinition {
                    id: Uuid::new_v4().to_string(),
                    kind: "ideas".into(),
                    index: 2,
                    label: String::new(),
                    color: String::new(),
                    icon: None,
                },
            ],
        )
    };
    let id = short_id();
    insert_session(pool, &id, None, author_id, encrypted, &options, false).await?;
    insert_columns(pool, &id, &columns).await?;
    store_visitor(pool, &id, author_id).await?;
    load_board(pool, &id).await?.ok_or(sqlx::Error::RowNotFound)
}

#[allow(clippy::too_many_arguments)]
async fn insert_session(
    pool: &PgPool,
    id: &str,
    name: Option<&str>,
    author_id: &str,
    encrypted: Option<&str>,
    options: &SessionOptions,
    demo: bool,
) -> DbResult<()> {
    sqlx::query(
        r#"INSERT INTO sessions (
            id, name, created_by_id, moderator_id, encrypted, demo,
            options_max_up_votes, options_max_down_votes, options_max_posts,
            options_allow_actions, options_allow_self_voting, options_allow_multiple_votes,
            options_allow_author_visible, options_allow_giphy, options_allow_grouping,
            options_allow_reordering, options_allow_cancel_vote, options_blur_cards,
            options_new_posts_first, options_allow_timer, options_timer_duration,
            options_readonly_on_timer_end, options_restrict_title_edit_to_moderator,
            options_restrict_reordering_to_moderator, options_restrict_grouping_to_moderator
        ) VALUES (
            $1,$2,$3,$3,$4,$5,
            $6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
        )"#,
    )
    .bind(id)
    .bind(name)
    .bind(author_id)
    .bind(encrypted)
    .bind(demo)
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

pub(crate) async fn insert_columns(
    pool: &PgPool,
    session_id: &str,
    columns: &[ColumnDefinition],
) -> DbResult<()> {
    for column in columns {
        sqlx::query(
            r#"INSERT INTO columns (id, type, index, label, color, icon, session_id) VALUES ($1,$2,$3,$4,$5,$6,$7)"#,
        )
        .bind(&column.id)
        .bind(&column.kind)
        .bind(column.index)
        .bind(&column.label)
        .bind(&column.color)
        .bind(&column.icon)
        .bind(session_id)
        .execute(pool)
        .await?;
    }
    Ok(())
}

pub async fn store_visitor(pool: &PgPool, session_id: &str, user_id: &str) -> DbResult<()> {
    sqlx::query(
        r#"INSERT INTO visitors (sessions_id, users_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"#,
    )
    .bind(session_id)
    .bind(user_id)
    .execute(pool)
    .await?;
    Ok(())
}
