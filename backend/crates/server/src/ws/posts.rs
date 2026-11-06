use serde_json::{json, Value};
use socketioxide::adapter::Adapter;
use socketioxide::extract::SocketRef;
use uuid::Uuid;

use super::{
    broadcast, emit_error, RECEIVE_CANCEL_VOTES, RECEIVE_DELETE_POST, RECEIVE_EDIT_POST,
    RECEIVE_LIKE, RECEIVE_POST,
};
use crate::db::{self};
use crate::models::{DeletePostPayload, IncomingPost, LikePayload, PostUpdate};
use crate::state::AppState;

pub(super) fn add_post<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Some((user_id, _)) = ids else {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        };
        let Ok(post) = serde_json::from_value::<IncomingPost>(payload) else {
            emit_error(&socket, "cannot_save_post", None);
            return;
        };
        let id = post.id.unwrap_or_else(|| Uuid::new_v4().to_string());
        let rank = post.rank.unwrap_or_else(db::middle_rank);
        match db::save_post(
            &state.db,
            &user_id,
            &session_id,
            &id,
            &post.content,
            post.column,
            post.action.as_deref(),
            post.giphy.as_deref(),
            &rank,
            post.group.as_ref().map(|group| group.id.as_str()),
        )
        .await
        {
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_POST, &saved).await,
            _ => emit_error(&socket, "cannot_save_post", None),
        }
    })
}

pub(super) fn edit_post<A: Adapter>(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Ok(update) = serde_json::from_value::<PostUpdate>(payload) else {
            emit_error(&socket, "cannot_edit_post", None);
            return;
        };
        match db::update_post(
            &state.db,
            &session_id,
            &update.post.id,
            &update.post.content,
            update.post.column,
            update.post.action.as_deref(),
            update.post.giphy.as_deref(),
            &update.post.rank,
            update.group_id.as_deref(),
        )
        .await
        {
            Ok(Some(post)) => broadcast(&socket, &session_id, RECEIVE_EDIT_POST, &post).await,
            _ => emit_error(&socket, "cannot_edit_post", None),
        }
    })
}

pub(super) fn delete_post<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Some((user_id, _)) = ids else {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        };
        let Ok(body) = serde_json::from_value::<DeletePostPayload>(payload.clone()) else {
            emit_error(&socket, "cannot_delete_post", None);
            return;
        };
        if db::delete_post(&state.db, &user_id, &body.post_id)
            .await
            .unwrap_or(false)
        {
            broadcast(&socket, &session_id, RECEIVE_DELETE_POST, &body).await;
        } else {
            emit_error(&socket, "cannot_delete_post", None);
        }
    })
}

pub(super) fn like_post<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Some((user_id, _)) = ids else {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        };
        let Ok(body) = serde_json::from_value::<LikePayload>(payload) else {
            emit_error(&socket, "cannot_register_vote", None);
            return;
        };
        match db::register_vote(&state.db, &user_id, &session_id, &body.post_id, &body.kind).await {
            Ok(Some(vote)) => {
                broadcast(
                    &socket,
                    &session_id,
                    RECEIVE_LIKE,
                    &json!({ "postId": body.post_id, "vote": vote }),
                )
                .await
            }
            _ => emit_error(&socket, "cannot_register_vote", None),
        }
    })
}

pub(super) fn cancel_votes<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Some((user_id, _)) = ids else {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        };
        let Ok(body) = serde_json::from_value::<DeletePostPayload>(payload) else {
            emit_error(&socket, "cannot_cancel_votes", None);
            return;
        };
        let _ = db::cancel_votes(&state.db, &user_id, &session_id, &body.post_id).await;
        broadcast(
            &socket,
            &session_id,
            RECEIVE_CANCEL_VOTES,
            &json!({ "postId": body.post_id, "userId": user_id }),
        )
        .await;
    })
}
