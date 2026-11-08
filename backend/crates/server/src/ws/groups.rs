use serde_json::Value;
use socketioxide::adapter::Adapter;
use socketioxide::extract::SocketRef;
use uuid::Uuid;

use super::{
    broadcast, emit_error, RECEIVE_DELETE_POST_GROUP, RECEIVE_EDIT_POST_GROUP, RECEIVE_POST_GROUP,
};
use crate::db::{self};
use crate::models::{DeleteGroupPayload, GroupUpdate, IncomingGroup};
use crate::state::AppState;

async fn grouping_allowed(state: &AppState, user_id: &str, session_id: &str) -> bool {
    let Ok(Some(board)) = db::load_board(&state.db, session_id).await else {
        return false;
    };
    db::can_group(
        user_id,
        &board.created_by.id,
        &board.moderator.id,
        &board.options,
    )
}

pub(super) fn add_group<A: Adapter>(
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
        if !grouping_allowed(&state, &user_id, &session_id).await {
            emit_error(&socket, "action_unauthorised", None);
            return;
        }
        let Ok(group) = serde_json::from_value::<IncomingGroup>(payload) else {
            emit_error(&socket, "cannot_save_group", None);
            return;
        };
        let id = group.id.unwrap_or_else(|| Uuid::new_v4().to_string());
        let rank = group.rank.unwrap_or_else(db::middle_rank);
        match db::save_group(
            &state.db,
            &user_id,
            &session_id,
            &id,
            &group.label,
            group.column,
            &rank,
        )
        .await
        {
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_POST_GROUP, &saved).await,
            _ => emit_error(&socket, "cannot_save_group", None),
        }
    })
}

pub(super) fn edit_group<A: Adapter>(
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
        if !grouping_allowed(&state, &user_id, &session_id).await {
            emit_error(&socket, "action_unauthorised", None);
            return;
        }
        let Ok(update) = serde_json::from_value::<GroupUpdate>(payload) else {
            emit_error(&socket, "cannot_edit_group", None);
            return;
        };
        match db::save_group(
            &state.db,
            &user_id,
            &session_id,
            &update.group.id,
            &update.group.label,
            update.group.column,
            &update.group.rank,
        )
        .await
        {
            Ok(Some(group)) => {
                broadcast(&socket, &session_id, RECEIVE_EDIT_POST_GROUP, &group).await
            }
            _ => emit_error(&socket, "cannot_edit_group", None),
        }
    })
}

pub(super) fn delete_group<A: Adapter>(
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
        if !grouping_allowed(&state, &user_id, &session_id).await {
            emit_error(&socket, "action_unauthorised", None);
            return;
        }
        let Ok(body) = serde_json::from_value::<DeleteGroupPayload>(payload) else {
            emit_error(&socket, "cannot_delete_group", None);
            return;
        };
        if db::delete_group(&state.db, &user_id, &session_id, &body.group_id)
            .await
            .unwrap_or(false)
        {
            broadcast(&socket, &session_id, RECEIVE_DELETE_POST_GROUP, &body).await;
        } else {
            emit_error(&socket, "cannot_delete_group", None);
        }
    })
}
