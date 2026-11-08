use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use super::DbResult;
use crate::models::FullUser;

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

/// True when some user row already stores this email.
pub async fn user_owns_email(pool: &PgPool, email: &str) -> DbResult<bool> {
    let id = sqlx::query_scalar::<_, String>("SELECT id FROM users WHERE email = $1")
        .bind(email.trim())
        .fetch_optional(pool)
        .await?;
    Ok(id.is_some())
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
    /// Provider asserted this address. Password accounts store their own address
    /// but never attach it to a user who already has it.
    pub email_verified: bool,
    pub password: Option<String>,
    pub email_verification: Option<String>,
    pub language: Option<String>,
    pub photo: Option<String>,
    pub slack_user_id: Option<String>,
    pub slack_team_id: Option<String>,
}

/// Why `register_user` refused or failed.
#[derive(Debug, thiserror::Error)]
pub enum RegisterError {
    /// A password registration asked for an email that already belongs to a user.
    #[error("email already registered")]
    EmailTaken,
    /// The database rejected the write.
    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

/// How an address on a registration may be written onto a user row.
#[derive(Debug, PartialEq, Eq)]
pub(crate) enum EmailLink {
    /// Password account. Store the address on a new user, never on someone else.
    Own,
    /// Provider-verified address. Attach to the user who already has it.
    Verified,
    /// Empty or unverified. Leave `users.email` null and do not look anyone up.
    None,
}

/// Decide whether this registration may store or adopt an email.
pub(crate) fn email_link(account_type: &str, email: &str, verified: bool) -> EmailLink {
    if email.trim().is_empty() {
        return EmailLink::None;
    }
    if account_type == "password" {
        EmailLink::Own
    } else if verified {
        EmailLink::Verified
    } else {
        EmailLink::None
    }
}

pub async fn register_user(
    pool: &PgPool,
    registration: Registration,
) -> Result<Identity, RegisterError> {
    let mut tx = pool.begin().await?;
    let link = email_link(
        &registration.account_type,
        &registration.email,
        registration.email_verified,
    );
    let stored_email = match link {
        EmailLink::None => None,
        EmailLink::Own | EmailLink::Verified => Some(registration.email.trim().to_owned()),
    };
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
        if link == EmailLink::Verified && email.as_deref() != stored_email.as_deref() {
            let (uid, existed) = get_or_create_user(
                &mut tx,
                stored_email.as_deref().unwrap_or(""),
                &registration.name,
            )
            .await?;
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
        let (uid, existed) = match link {
            EmailLink::Own => {
                let email = stored_email.as_deref().unwrap_or("");
                if user_id_by_email(&mut tx, email).await?.is_some() {
                    return Err(RegisterError::EmailTaken);
                }
                (
                    create_user(&mut tx, &registration.name, Some(email)).await?,
                    false,
                )
            }
            EmailLink::Verified => {
                get_or_create_user(
                    &mut tx,
                    stored_email.as_deref().unwrap_or(""),
                    &registration.name,
                )
                .await?
            }
            EmailLink::None => (create_user(&mut tx, &registration.name, None).await?, false),
        };
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
        r#"UPDATE users SET name = COALESCE(NULLIF(name, ''), $2), email = COALESCE($3, email), photo = COALESCE($4, photo),
               slack_user_id = COALESCE($5, slack_user_id), slack_team_id = COALESCE($6, slack_team_id),
               language = CASE WHEN $7 THEN COALESCE($8, language) ELSE language END
           WHERE id = $1"#,
    )
    .bind(&user_id)
    .bind(&registration.name)
    .bind(&stored_email)
    .bind(&registration.photo)
    .bind(&registration.slack_user_id)
    .bind(&registration.slack_team_id)
    .bind(!existed_user)
    .bind(&registration.language)
    .execute(&mut *tx)
    .await?;

    if had_identity {
        sqlx::query(
            r#"UPDATE users_identities SET username = $2, photo = COALESCE($3, photo) WHERE id = $1"#,
        )
        .bind(&identity_id)
        .bind(&registration.username)
        .bind(&registration.photo)
        .execute(&mut *tx)
        .await?;
    }
    tx.commit().await?;
    identity(pool, &identity_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
        .map_err(RegisterError::Db)
}

async fn user_id_by_email(
    tx: &mut Transaction<'_, Postgres>,
    email: &str,
) -> Result<Option<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(&mut **tx)
        .await
}

async fn create_user(
    tx: &mut Transaction<'_, Postgres>,
    name: &str,
    email: Option<&str>,
) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO users (id, name, email) VALUES ($1, $2, $3)")
        .bind(&id)
        .bind(name)
        .bind(email)
        .execute(&mut **tx)
        .await?;
    Ok(id)
}

async fn get_or_create_user(
    tx: &mut Transaction<'_, Postgres>,
    email: &str,
    name: &str,
) -> Result<(String, bool), sqlx::Error> {
    if let Some(id) = user_id_by_email(tx, email).await? {
        return Ok((id, true));
    }
    Ok((create_user(tx, name, Some(email)).await?, false))
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

#[cfg(test)]
mod tests {
    use super::{email_link, EmailLink};

    #[test]
    fn password_addresses_are_stored_but_unverified_provider_mail_is_not() {
        assert_eq!(
            email_link("password", "ada@example.com", false),
            EmailLink::Own
        );
        assert_eq!(
            email_link("google", "ada@example.com", true),
            EmailLink::Verified
        );
        assert_eq!(
            email_link("google", "ada@example.com", false),
            EmailLink::None
        );
        assert_eq!(email_link("slack", "  ", true), EmailLink::None);
    }
}
