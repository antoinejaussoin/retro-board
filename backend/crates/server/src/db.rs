//! SQL against the schema produced by the TypeORM migrations.

use chrono::{DateTime, Duration, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::models::{
    Board, ColumnDefinition, FullUser, Message, Post, PostGroup, SessionMetadata, SessionOptions,
    User, VoteExtract,
};
use retrospected_migrations::Rank;

pub type DbResult<T> = Result<T, sqlx::Error>;

#[derive(sqlx::FromRow)]
struct UserViewRow {
    id: String,
    identity_id: String,
    name: String,
    account_type: String,
    username: Option<String>,
    currency: Option<String>,
    stripe_id: Option<String>,
    photo: Option<String>,
    language: Option<String>,
    email: Option<String>,
    can_delete_session: bool,
    trial: Option<DateTime<Utc>>,
    own_subscriptions_id: Option<String>,
    own_plan: Option<String>,
    pro: bool,
    plan: Option<String>,
    domain: Option<String>,
    plan_owner: Option<String>,
    plan_owner_email: Option<String>,
    plan_admins: Option<Vec<String>>,
    plan_members: Option<Vec<String>>,
}

impl UserViewRow {
    fn into_full(self, force_pro: bool) -> FullUser {
        FullUser {
            id: self.id,
            identity_id: self.identity_id,
            name: self.name,
            photo: self.photo,
            email: self.email,
            can_delete_session: self.can_delete_session,
            pro: self.pro || force_pro,
            account_type: self.account_type,
            language: self.language,
            username: self.username,
            stripe_id: self.stripe_id,
            currency: self.currency,
            plan: self.plan,
            plan_owner: self.plan_owner,
            plan_owner_email: self.plan_owner_email,
            plan_admins: self.plan_admins,
            plan_members: self.plan_members,
            domain: self.domain,
            own_plan: self.own_plan,
            own_subscriptions_id: self.own_subscriptions_id,
            trial: self.trial,
        }
    }
}

const USER_VIEW_SQL: &str = r#"
SELECT id, identity_id, name, account_type, username, currency, stripe_id, photo, language, email,
       can_delete_session, trial, own_subscriptions_id, own_plan, pro, plan, domain,
       plan_owner, plan_owner_email, plan_admins, plan_members
FROM user_view
"#;

pub async fn user_by_identity(
    pool: &PgPool,
    identity_id: &str,
    force_pro: bool,
) -> DbResult<Option<FullUser>> {
    let row = sqlx::query_as::<_, UserViewRow>(&format!("{USER_VIEW_SQL} WHERE identity_id = $1"))
        .bind(identity_id)
        .fetch_optional(pool)
        .await?;
    Ok(row.map(|row| row.into_full(force_pro)))
}

pub async fn user_by_id(
    pool: &PgPool,
    user_id: &str,
    force_pro: bool,
) -> DbResult<Option<FullUser>> {
    let row = sqlx::query_as::<_, UserViewRow>(&format!("{USER_VIEW_SQL} WHERE id = $1 LIMIT 1"))
        .bind(user_id)
        .fetch_optional(pool)
        .await?;
    Ok(row.map(|row| row.into_full(force_pro)))
}

pub async fn users_except_deleted(pool: &PgPool, force_pro: bool) -> DbResult<Vec<FullUser>> {
    let rows = sqlx::query_as::<_, UserViewRow>(&format!(
        "{USER_VIEW_SQL} WHERE name <> '(deleted user)'"
    ))
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .map(|row| row.into_full(force_pro))
        .collect())
}

pub struct Identity {
    pub id: String,
    pub user_id: String,
    pub account_type: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub email_verification: Option<String>,
    pub photo: Option<String>,
    pub user_name: String,
    pub user_email: Option<String>,
    pub stripe_id: Option<String>,
}

pub async fn identity(pool: &PgPool, identity_id: &str) -> DbResult<Option<Identity>> {
    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, String, Option<String>, Option<String>)>(
        r#"SELECT i.id, i.user_id, i.account_type, i.username, i.password, i.email_verification, i.photo,
                  u.name, u.email, u.stripe_id
           FROM users_identities i JOIN users u ON u.id = i.user_id WHERE i.id = $1"#,
    )
    .bind(identity_id)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|row| Identity {
        id: row.0,
        user_id: row.1,
        account_type: row.2,
        username: row.3,
        password: row.4,
        email_verification: row.5,
        photo: row.6,
        user_name: row.7,
        user_email: row.8,
        stripe_id: row.9,
    }))
}

pub async fn identity_by_username(
    pool: &PgPool,
    account_type: &str,
    username: &str,
) -> DbResult<Option<Identity>> {
    let row = sqlx::query_as::<_, (String, String, String, Option<String>, Option<String>, Option<String>, Option<String>, String, Option<String>, Option<String>)>(
        r#"SELECT i.id, i.user_id, i.account_type, i.username, i.password, i.email_verification, i.photo,
                  u.name, u.email, u.stripe_id
           FROM users_identities i JOIN users u ON u.id = i.user_id
           WHERE i.account_type = $1 AND i.username = $2"#,
    )
    .bind(account_type)
    .bind(username)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|row| Identity {
        id: row.0,
        user_id: row.1,
        account_type: row.2,
        username: row.3,
        password: row.4,
        email_verification: row.5,
        photo: row.6,
        user_name: row.7,
        user_email: row.8,
        stripe_id: row.9,
    }))
}

pub async fn password_identity_for_user(
    pool: &PgPool,
    user_id: &str,
) -> DbResult<Option<Identity>> {
    let row = sqlx::query_as::<_, (String,)>(
        r#"SELECT id FROM users_identities WHERE user_id = $1 AND account_type = 'password' LIMIT 1"#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;
    match row {
        Some((id,)) => identity(pool, &id).await,
        None => Ok(None),
    }
}

pub struct Registration {
    pub account_type: String,
    pub name: String,
    pub username: String,
    pub email: String,
    pub password: Option<String>,
    pub email_verification: Option<String>,
    pub language: Option<String>,
    pub photo: Option<String>,
    pub slack_user_id: Option<String>,
    pub slack_team_id: Option<String>,
}

pub async fn register_user(pool: &PgPool, registration: Registration) -> DbResult<Identity> {
    let mut tx = pool.begin().await?;
    let existing = sqlx::query_as::<_, (String, String)>(
        r#"SELECT id, user_id FROM users_identities WHERE username = $1 AND account_type = $2 LIMIT 1"#,
    )
    .bind(&registration.username)
    .bind(&registration.account_type)
    .fetch_optional(&mut *tx)
    .await?;

    let had_identity = existing.is_some();
    let (identity_id, user_id, existed_user) = if let Some((identity_id, user_id)) = existing {
        let email: Option<String> = sqlx::query_scalar("SELECT email FROM users WHERE id = $1")
            .bind(&user_id)
            .fetch_one(&mut *tx)
            .await?;
        if email.as_deref() != Some(registration.email.as_str()) {
            let (uid, existed) =
                get_or_create_user(&mut tx, &registration.email, &registration.name).await?;
            sqlx::query("UPDATE users_identities SET user_id = $1 WHERE id = $2")
                .bind(&uid)
                .bind(&identity_id)
                .execute(&mut *tx)
                .await?;
            (identity_id, uid, existed)
        } else {
            (identity_id, user_id, true)
        }
    } else {
        let (uid, existed) =
            get_or_create_user(&mut tx, &registration.email, &registration.name).await?;
        let identity_id = Uuid::new_v4().to_string();
        sqlx::query(
            r#"INSERT INTO users_identities (id, user_id, account_type, username, password, email_verification, photo)
               VALUES ($1, $2, $3, $4, $5, $6, $7)"#,
        )
        .bind(&identity_id)
        .bind(&uid)
        .bind(&registration.account_type)
        .bind(&registration.username)
        .bind(&registration.password)
        .bind(&registration.email_verification)
        .bind(&registration.photo)
        .execute(&mut *tx)
        .await?;
        (identity_id, uid, existed)
    };

    sqlx::query(
        r#"UPDATE users SET name = COALESCE(NULLIF(name, ''), $2), email = $3, photo = COALESCE($4, photo),
               slack_user_id = COALESCE($5, slack_user_id), slack_team_id = COALESCE($6, slack_team_id),
               language = CASE WHEN $7 THEN COALESCE($8, language) ELSE language END
           WHERE id = $1"#,
    )
    .bind(&user_id)
    .bind(&registration.name)
    .bind(&registration.email)
    .bind(&registration.photo)
    .bind(&registration.slack_user_id)
    .bind(&registration.slack_team_id)
    .bind(!existed_user)
    .bind(&registration.language)
    .execute(&mut *tx)
    .await?;

    if had_identity {
        sqlx::query(
            r#"UPDATE users_identities SET username = $2, account_type = $3, photo = $4, password = $5, email_verification = $6 WHERE id = $1"#,
        )
        .bind(&identity_id)
        .bind(&registration.username)
        .bind(&registration.account_type)
        .bind(&registration.photo)
        .bind(&registration.password)
        .bind(&registration.email_verification)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await?;
    identity(pool, &identity_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

async fn get_or_create_user(
    tx: &mut Transaction<'_, Postgres>,
    email: &str,
    name: &str,
) -> DbResult<(String, bool)> {
    if let Some(id) = sqlx::query_scalar::<_, String>("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(&mut **tx)
        .await?
    {
        return Ok((id, true));
    }
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO users (id, name, email) VALUES ($1, $2, $3)")
        .bind(&id)
        .bind(name)
        .bind(email)
        .execute(&mut **tx)
        .await?;
    Ok((id, false))
}

pub async fn register_anonymous(
    pool: &PgPool,
    username: &str,
    password_hash: &str,
) -> DbResult<Option<Identity>> {
    let display = username.split('^').next().unwrap_or(username);
    if let Some(existing) = identity_by_username(pool, "anonymous", username).await? {
        if existing.password.is_none() {
            sqlx::query("UPDATE users_identities SET password = $2 WHERE id = $1")
                .bind(&existing.id)
                .bind(password_hash)
                .execute(pool)
                .await?;
            return identity(pool, &existing.id).await;
        }
        return Ok(Some(existing));
    }
    let user_id = Uuid::new_v4().to_string();
    let identity_id = Uuid::new_v4().to_string();
    let mut tx = pool.begin().await?;
    sqlx::query("INSERT INTO users (id, name) VALUES ($1, $2)")
        .bind(&user_id)
        .bind(display)
        .execute(&mut *tx)
        .await?;
    sqlx::query(
        r#"INSERT INTO users_identities (id, user_id, account_type, username, password)
           VALUES ($1, $2, 'anonymous', $3, $4)"#,
    )
    .bind(&identity_id)
    .bind(&user_id)
    .bind(username)
    .bind(password_hash)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;
    identity(pool, &identity_id).await
}

pub async fn update_user_name(pool: &PgPool, user_id: &str, name: &str) -> DbResult<bool> {
    let result = sqlx::query("UPDATE users SET name = $2 WHERE id = $1")
        .bind(user_id)
        .bind(name)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn update_language(pool: &PgPool, user_id: &str, language: &str) -> DbResult<()> {
    sqlx::query("UPDATE users SET language = $2 WHERE id = $1")
        .bind(user_id)
        .bind(language)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn set_password(pool: &PgPool, identity_id: &str, hash: &str) -> DbResult<()> {
    sqlx::query(
        "UPDATE users_identities SET password = $2, email_verification = NULL WHERE id = $1",
    )
    .bind(identity_id)
    .bind(hash)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn set_verification(
    pool: &PgPool,
    identity_id: &str,
    code: Option<&str>,
) -> DbResult<()> {
    sqlx::query("UPDATE users_identities SET email_verification = $2 WHERE id = $1")
        .bind(identity_id)
        .bind(code)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn set_stripe_customer(pool: &PgPool, user_id: &str, stripe_id: &str) -> DbResult<()> {
    sqlx::query("UPDATE users SET stripe_id = $2 WHERE id = $1")
        .bind(user_id)
        .bind(stripe_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn quota(pool: &PgPool, user_id: &str) -> DbResult<(i64, i32)> {
    let posts: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM posts WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    let limit: i32 = sqlx::query_scalar("SELECT quota FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_optional(pool)
        .await?
        .unwrap_or(50);
    Ok((posts, limit))
}

pub async fn related_users(
    pool: &PgPool,
    user_id: &str,
    force_pro: bool,
) -> DbResult<Vec<FullUser>> {
    let ids = sqlx::query_scalar::<_, String>(
        r#"SELECT DISTINCT u2.id FROM users u
           LEFT JOIN visitors v ON v.users_id = u.id
           LEFT JOIN sessions s ON v.sessions_id = s.id
           LEFT JOIN visitors v2 ON v2.sessions_id = s.id
           LEFT JOIN users u2 ON v2.users_id = u2.id
           WHERE u.id = $1 AND u2.email IS NOT NULL"#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;
    let mut users = Vec::new();
    for id in ids {
        if let Some(user) = user_by_id(pool, &id, force_pro).await? {
            users.push(user);
        }
    }
    Ok(users)
}

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

async fn insert_columns(
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

fn options_from_tuple(row: OptRow) -> SessionOptions {
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
           ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, "column" = EXCLUDED."column", rank = EXCLUDED.rank"#,
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
    let result = sqlx::query("DELETE FROM groups WHERE id = $1")
        .bind(group_id)
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
    } else {
        sqlx::query("UPDATE votes SET user_id = $1 WHERE user_id = $2")
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
