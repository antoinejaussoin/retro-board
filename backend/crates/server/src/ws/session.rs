use serde_json::{json, Value};
use socketioxide::adapter::Adapter;
use socketioxide::extract::SocketRef;
use uuid::Uuid;

use super::{
    broadcast, emit_error, room, send_clients_simple, user_summary, BoardRoom, OnlineUser,
    RECEIVE_BOARD, RECEIVE_CHAT, RECEIVE_LOCK_SESSION, RECEIVE_SESSION_SETTINGS,
    RECEIVE_TIMER_START, RECEIVE_TIMER_STOP, RECEIVE_UNAUTHORIZED, RECEIVE_USER_READY,
};
use crate::db::{self};
use crate::models::{ChatIn, SettingsPayload};
use crate::state::AppState;

pub(super) fn chat<A: Adapter>(
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
        let Ok(message) = serde_json::from_value::<ChatIn>(payload) else {
            emit_error(&socket, "cannot_record_chat_message", None);
            return;
        };
        let id = message.id.unwrap_or_else(|| Uuid::new_v4().to_string());
        match db::save_message(&state.db, &user_id, &session_id, &id, &message.content).await {
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_CHAT, &saved).await,
            _ => emit_error(&socket, "cannot_record_chat_message", None),
        }
    })
}

pub(super) fn start_timer<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        if ids.is_none() {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        }
        match db::start_timer(&state.db, &session_id).await {
            Ok(duration) => {
                broadcast(
                    &socket,
                    &session_id,
                    RECEIVE_TIMER_START,
                    &json!({ "duration": duration }),
                )
                .await
            }
            Err(_) => emit_error(&socket, "unknown_error", None),
        }
    })
}

pub(super) fn stop_timer<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        if ids.is_none() {
            emit_error(
                &socket,
                "action_unauthorised",
                Some("User not authenticated".into()),
            );
            return;
        }
        let _ = db::stop_timer(&state.db, &session_id).await;
        broadcast(&socket, &session_id, RECEIVE_TIMER_STOP, &json!(null)).await;
    })
}

pub(super) fn request_board<A: Adapter>(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        match db::load_board(&state.db, &session_id).await {
            Ok(Some(board)) => {
                let _ = socket.emit(RECEIVE_BOARD, &board);
            }
            _ => emit_error(&socket, "cannot_get_session", None),
        }
    })
}

pub(super) fn join<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        socket.join(room(&session_id));
        socket.extensions.insert(BoardRoom(session_id.clone()));
        let user = if let Some((_, identity_id)) = &ids {
            db::user_by_identity(&state.db, identity_id, state.force_pro())
                .await
                .ok()
                .flatten()
        } else {
            None
        };
        let Some(access) = db::access(&state.db, &session_id).await.ok().flatten() else {
            emit_error(&socket, "cannot_get_session", None);
            return;
        };
        if let Err(reason) = db::allowed(&access, user.as_ref(), state.force_pro()) {
            let board = if reason == "locked" {
                db::load_board(&state.db, &session_id).await.ok().flatten()
            } else {
                None
            };
            let _ = socket.emit(
                RECEIVE_UNAUTHORIZED,
                &json!({ "type": reason, "session": board }),
            );
            let _ = socket.clone().disconnect();
            return;
        }
        if let Some(user) = &user {
            let _ = db::store_visitor(&state.db, &session_id, &user.id).await;
            socket.extensions.insert(OnlineUser(user_summary(user)));
        }
        if let Ok(Some(board)) = db::load_board(&state.db, &session_id).await {
            if let Some(timer) = board.timer {
                let duration = (timer - chrono::Utc::now()).num_seconds();
                let _ = socket.emit(RECEIVE_TIMER_START, &json!({ "duration": duration }));
            }
            let _ = socket.emit(RECEIVE_BOARD, &board);
        }
        send_clients_simple(&state, &socket, &session_id).await;
    })
}

pub(super) fn leave<A: Adapter>(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        socket.leave(room(&session_id));
        send_clients_simple(&state, &socket, &session_id).await;
    })
}

pub(super) fn ready<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
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
        let ready = db::toggle_ready(&state.db, &session_id, &user_id)
            .await
            .unwrap_or(false);
        let name = db::user_by_id(&state.db, &user_id, false)
            .await
            .ok()
            .flatten()
            .map(|user| user.name)
            .unwrap_or_else(|| "Somebody".into());
        broadcast(
            &socket,
            &session_id,
            RECEIVE_USER_READY,
            &json!({ "userId": user_id, "name": name, "ready": ready }),
        )
        .await;
    })
}

pub(super) fn settings<A: Adapter>(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let Ok(body) = serde_json::from_value::<SettingsPayload>(payload) else {
            emit_error(&socket, "cannot_save_session_settings", None);
            return;
        };
        if let Some(options) = &body.settings.options {
            let _ = db::update_options(&state.db, &session_id, options).await;
        }
        if let Some(columns) = &body.settings.columns {
            let _ = db::replace_columns(&state.db, &session_id, columns).await;
        }
        if let Some(name) = &body.settings.name {
            let _ = db::rename_session(&state.db, &session_id, name).await;
        }
        if let Some(moderator) = &body.settings.moderator {
            let _ = db::set_moderator(&state.db, &session_id, &moderator.id).await;
        }
        if body.save_as_template {
            if let Some((user_id, _)) = ids {
                if let (Some(columns), Some(options)) =
                    (&body.settings.columns, &body.settings.options)
                {
                    let _ = db::save_template(&state.db, &user_id, columns, options).await;
                }
            }
        }
        broadcast(
            &socket,
            &session_id,
            RECEIVE_SESSION_SETTINGS,
            &body.settings,
        )
        .await;
    })
}

pub(super) fn lock<A: Adapter>(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef<A>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let locked = payload.as_bool().unwrap_or(false);
        let _ = db::set_locked(&state.db, &session_id, locked).await;
        broadcast(&socket, &session_id, RECEIVE_LOCK_SESSION, &locked).await;
    })
}
