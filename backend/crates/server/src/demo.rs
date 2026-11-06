//! Seeded demo board matching `createDemoSession`.

use sqlx::PgPool;
use uuid::Uuid;

use crate::db::{self, DbResult};
use crate::models::{Board, SessionOptions};

pub async fn create(pool: &PgPool, author_id: &str) -> DbResult<Board> {
    let mut board = db::create_session(pool, author_id, None).await?;
    let mut options = SessionOptions::default();
    options.allow_actions = true;
    options.allow_giphy = true;
    options.allow_multiple_votes = true;
    options.allow_reordering = true;
    options.allow_self_voting = true;
    options.allow_timer = true;
    options.allow_cancel_vote = true;
    options.allow_grouping = true;
    options.max_down_votes = Some(20.0);
    options.max_up_votes = Some(20.0);
    options.readonly_on_timer_end = true;
    db::mark_demo(pool, &board.id, &options).await?;
    let other =
        db::register_anonymous(pool, &format!("John Doe^{}", Uuid::new_v4()), &uuid_hash()).await?;
    let Some(other) = other else {
        return db::load_board(pool, &board.id)
            .await?
            .ok_or(sqlx::Error::RowNotFound);
    };
    let mut rank = db::middle_rank();
    let posts = [
        ("I'm enjoying our new retrospective board!", 0, 5, false),
        ("I love how we can vote on posts", 0, 0, false),
        ("I wish I discovered this tool sooner 😅", 1, 2, true),
        (
            "Have you tried different settings? Click on \"Customise\" to see what you can do.",
            2,
            0,
            false,
        ),
        (
            "Try Giphy by clicking on the yellow smiley face!",
            2,
            1,
            true,
        ),
        (
            "You can also share this URL with somebody else to collaborate on the same board.",
            2,
            0,
            false,
        ),
    ];
    for (content, column, votes, own) in posts {
        rank = db::next_rank(&rank);
        let author = if own {
            author_id
        } else {
            other.user_id.as_str()
        };
        if let Some(post) = db::save_post(
            pool,
            author,
            &board.id,
            &Uuid::new_v4().to_string(),
            content,
            column,
            None,
            None,
            &rank,
            None,
        )
        .await?
        {
            for _ in 0..votes {
                let _ = db::register_vote(pool, &other.user_id, &board.id, &post.id, "like").await;
            }
        }
    }
    board = db::load_board(pool, &board.id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)?;
    board.name = Some("My Retro Demo".into());
    board.demo = true;
    board.options = options;
    Ok(board)
}

fn uuid_hash() -> String {
    crate::crypto::hash_password(&Uuid::new_v4().to_string()).unwrap_or_default()
}
