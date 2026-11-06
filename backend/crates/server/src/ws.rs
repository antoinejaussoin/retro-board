//! Socket.IO board events. Names match `backend/src/common/actions.ts`.

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::{json, Value};
use socketioxide::extract::{Data, SocketRef, State};
use socketioxide::SocketIo;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::db::{self};
use crate::models::{
    ChatIn, DeleteGroupPayload, DeletePostPayload, FullUser, GroupUpdate, IncomingGroup,
    IncomingPost, LikePayload, Participant, PostUpdate, SettingsPayload, User, WsError,
};
use crate::state::AppState;

const ACK: &str = "retrospected/ack";
const RECEIVE_POST: &str = "retrospected/posts/receive/add";
const RECEIVE_DELETE_POST: &str = "retrospected/posts/receive/delete";
const RECEIVE_EDIT_POST: &str = "retrospected/posts/receive/edit";
const RECEIVE_LIKE: &str = "retrospected/posts/receive/like";
const RECEIVE_CANCEL_VOTES: &str = "retrospected/posts/receive/cancel-votes";
const RECEIVE_POST_GROUP: &str = "retrospected/group/receive/add";
const RECEIVE_DELETE_POST_GROUP: &str = "retrospected/group/receive/delete";
const RECEIVE_EDIT_POST_GROUP: &str = "retrospected/group/receive/edit";
const RECEIVE_BOARD: &str = "retrospected/posts/receive-all";
const RECEIVE_SESSION_SETTINGS: &str = "retrospected/session/settings/receive";
const RECEIVE_CLIENT_LIST: &str = "retrospected/session/receive/client-list";
const RECEIVE_LOCK_SESSION: &str = "retrospected/session/receive/lock";
const RECEIVE_UNAUTHORIZED: &str = "retrospected/session/receive/unauthorized";
const RECEIVE_RATE_LIMITED: &str = "retrospected/rate-limited-error";
const RECEIVE_ERROR: &str = "retrospected/receive/error";
const RECEIVE_USER_READY: &str = "retrospected/receive/user-ready";
const RECEIVE_CHAT: &str = "retrospected/session/chat/receive";
const RECEIVE_TIMER_START: &str = "retrospected/timer/start/receive";
const RECEIVE_TIMER_STOP: &str = "retrospected/timer/stop/receive";

#[derive(Clone, Default)]
struct Presence(Arc<Mutex<HashMap<String, Option<User>>>>);

pub fn register(io: &SocketIo) {
    let presence = presence();
    let presence = presence.clone();
    io.ns(
        "/",
        move |socket: SocketRef, State(state): State<AppState>| {
            let presence = presence.clone();
            let ids = ids_from_socket(&state, &socket);
            socket.extensions.insert(WsIds(ids.clone()));
            socket.on("retrospected/posts/add/success", {
                let presence = presence.clone();
                move |socket: SocketRef, Data(value): Data<Value>, State(state): State<AppState>| {
                    let _ = &presence;
                    on_message(
                        socket,
                        state,
                        value,
                        false,
                        |state, ids, session_id, payload, socket| {
                            Box::pin(add_post(state, ids, session_id, payload, socket))
                        },
                    );
                }
            });
            register_handlers(socket, state, presence);
        },
    );
}

fn register_handlers(socket: SocketRef, _state: AppState, presence: Presence) {
    bind(&socket, "retrospected/posts/edit", false, edit_post);
    bind(&socket, "retrospected/posts/delete", false, delete_post);
    bind(&socket, "retrospected/posts/like/success", false, like_post);
    bind(
        &socket,
        "retrospected/posts/cancel-votes/success",
        false,
        cancel_votes,
    );
    bind(&socket, "retrospected/group/add/success", false, add_group);
    bind(&socket, "retrospected/group/edit", false, edit_group);
    bind(&socket, "retrospected/group/delete", false, delete_group);
    bind(&socket, "retrospected/session/chat", false, chat);
    bind(&socket, "retrospected/timer/start", false, start_timer);
    bind(&socket, "retrospected/timer/stop", false, stop_timer);
    bind(&socket, "retrospected/session/join", false, join);
    bind(
        &socket,
        "retrospected/session/request",
        false,
        request_board,
    );
    bind(&socket, "retrospected/session/leave", false, leave);
    bind(&socket, "retrospected/user-ready", false, ready);
    bind(
        &socket,
        "retrospected/session/settings/save",
        false,
        settings,
    );
    bind(&socket, "retrospected/session/lock", true, lock);
    let presence_disconnect = presence.clone();
    socket.on_disconnect(
        move |socket: SocketRef,
              State(state): State<AppState>,
              _: socketioxide::socket::DisconnectReason| {
            let presence = presence_disconnect.clone();
            async move {
                if let Some(session_id) = socket
                    .extensions
                    .get::<BoardRoom>()
                    .map(|room| room.0.clone())
                {
                    send_clients(&state, &presence, &socket, &session_id).await;
                }
            }
        },
    );
    let _ = presence;
}

fn bind(
    socket: &SocketRef,
    event: &'static str,
    only_author: bool,
    handler: fn(
        AppState,
        Option<(String, String)>,
        String,
        Value,
        SocketRef,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>>,
) {
    socket.on(
        event,
        move |socket: SocketRef, Data(value): Data<Value>, State(state): State<AppState>| {
            on_message(socket, state, value, only_author, handler);
        },
    );
}

fn on_message(
    socket: SocketRef,
    state: AppState,
    value: Value,
    only_author: bool,
    handler: fn(
        AppState,
        Option<(String, String)>,
        String,
        Value,
        SocketRef,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>>,
) {
    tokio::spawn(async move {
        let ack = value
            .get("ack")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        let _ = socket.emit(ACK, &ack);
        let session_id = if value.get("payload").is_some() {
            value
                .get("sessionId")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_owned()
        } else {
            String::new()
        };
        let session_id = if event_is_leave(&value) {
            socket
                .extensions
                .get::<BoardRoom>()
                .map(|room| room.0.clone())
                .unwrap_or(session_id)
        } else {
            value
                .get("sessionId")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_owned()
        };
        if session_id.is_empty() {
            return;
        }
        if !state.ws_limit.allow(&session_id).await {
            let _ = socket.emit(RECEIVE_RATE_LIMITED, &json!({}));
            return;
        }
        if !db::session_exists(&state.db, &session_id)
            .await
            .unwrap_or(false)
        {
            emit_error(&socket, "cannot_get_session", None);
            return;
        }
        let ids = load_ids(&state, &socket).await;
        if only_author {
            let ok = if let Some((user_id, _)) = &ids {
                db::created_by(&state.db, &session_id, user_id)
                    .await
                    .unwrap_or(false)
            } else {
                false
            };
            if !ok {
                emit_error(&socket, "action_unauthorised", None);
                return;
            }
        }
        handler(
            state,
            ids,
            session_id,
            value.get("payload").cloned().unwrap_or(Value::Null),
            socket,
        )
        .await;
    });
}

fn event_is_leave(value: &Value) -> bool {
    value.get("sessionId").is_none()
}

async fn load_ids(state: &AppState, socket: &SocketRef) -> Option<(String, String)> {
    let header = socket
        .req_parts()
        .headers
        .get(axum::http::header::COOKIE)?
        .to_str()
        .ok()?;
    let sid = state.sessions.from_cookie(Some(header))?;
    state.sessions.load(&sid).await?.user_ids()
}

#[derive(Clone)]
struct WsIds(Option<(String, String)>);

#[derive(Clone)]
struct BoardRoom(String);

fn ids_from_socket(state: &AppState, socket: &SocketRef) -> Option<(String, String)> {
    let header = socket
        .req_parts()
        .headers
        .get(axum::http::header::COOKIE)
        .and_then(|value| value.to_str().ok());
    let sid = state.sessions.from_cookie(header)?;
    // Session load is async; the connect handler cannot wait here. The message handlers reload.
    let _ = sid;
    None
}

fn emit_error(socket: &SocketRef, kind: &'static str, details: Option<String>) {
    let _ = socket.emit(RECEIVE_ERROR, &WsError { kind, details });
}

fn room(session_id: &str) -> String {
    format!("board-{session_id}")
}

fn broadcast(socket: &SocketRef, session_id: &str, event: &str, data: &impl serde::Serialize) {
    drop(socket.to(room(session_id)).emit(event, data));
}

fn add_post(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_POST, &saved),
            _ => emit_error(&socket, "cannot_save_post", None),
        }
    })
}

fn edit_post(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(post)) => broadcast(&socket, &session_id, RECEIVE_EDIT_POST, &post),
            _ => emit_error(&socket, "cannot_edit_post", None),
        }
    })
}

fn delete_post(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            broadcast(&socket, &session_id, RECEIVE_DELETE_POST, &body);
        } else {
            emit_error(&socket, "cannot_delete_post", None);
        }
    })
}

fn like_post(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(vote)) => broadcast(
                &socket,
                &session_id,
                RECEIVE_LIKE,
                &json!({ "postId": body.post_id, "vote": vote }),
            ),
            _ => emit_error(&socket, "cannot_register_vote", None),
        }
    })
}

fn cancel_votes(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
        );
    })
}

fn add_group(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_POST_GROUP, &saved),
            _ => emit_error(&socket, "cannot_save_group", None),
        }
    })
}

fn edit_group(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(group)) => broadcast(&socket, &session_id, RECEIVE_EDIT_POST_GROUP, &group),
            _ => emit_error(&socket, "cannot_edit_group", None),
        }
    })
}

fn delete_group(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
        let Ok(body) = serde_json::from_value::<DeleteGroupPayload>(payload) else {
            emit_error(&socket, "cannot_delete_group", None);
            return;
        };
        if db::delete_group(&state.db, &user_id, &session_id, &body.group_id)
            .await
            .unwrap_or(false)
        {
            broadcast(&socket, &session_id, RECEIVE_DELETE_POST_GROUP, &body);
        } else {
            emit_error(&socket, "cannot_delete_group", None);
        }
    })
}

fn chat(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
            Ok(Some(saved)) => broadcast(&socket, &session_id, RECEIVE_CHAT, &saved),
            _ => emit_error(&socket, "cannot_record_chat_message", None),
        }
    })
}

fn start_timer(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
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
            Ok(duration) => broadcast(
                &socket,
                &session_id,
                RECEIVE_TIMER_START,
                &json!({ "duration": duration }),
            ),
            Err(_) => emit_error(&socket, "unknown_error", None),
        }
    })
}

fn stop_timer(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
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
        broadcast(&socket, &session_id, RECEIVE_TIMER_STOP, &json!(null));
    })
}

fn request_board(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
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

fn join(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
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

fn leave(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        socket.leave(room(&session_id));
        send_clients_simple(&state, &socket, &session_id).await;
    })
}

fn ready(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    _payload: Value,
    socket: SocketRef,
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
        );
    })
}

fn settings(
    state: AppState,
    ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
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
        );
    })
}

fn lock(
    state: AppState,
    _ids: Option<(String, String)>,
    session_id: String,
    payload: Value,
    socket: SocketRef,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>> {
    Box::pin(async move {
        let locked = payload.as_bool().unwrap_or(false);
        let _ = db::set_locked(&state.db, &session_id, locked).await;
        broadcast(&socket, &session_id, RECEIVE_LOCK_SESSION, &locked);
    })
}

#[derive(Clone)]
struct OnlineUser(User);

fn user_summary(user: &FullUser) -> User {
    User {
        id: user.id.clone(),
        name: user.name.clone(),
        photo: user.photo.clone(),
        email: user.email.clone(),
    }
}

async fn send_clients(
    _state: &AppState,
    _presence: &Presence,
    socket: &SocketRef,
    session_id: &str,
) {
    send_clients_simple(_state, socket, session_id).await;
}

async fn send_clients_simple(state: &AppState, socket: &SocketRef, session_id: &str) {
    let sockets = socket.within(room(session_id)).sockets();
    let mut online = Vec::new();
    for (index, peer) in sockets.iter().enumerate() {
        let user = peer
            .extensions
            .get::<OnlineUser>()
            .map(|user| Participant {
                id: user.0.id.clone(),
                name: user.0.name.clone(),
                email: user.0.email.clone(),
                photo: user.0.photo.clone(),
                online: true,
            })
            .unwrap_or(Participant {
                id: peer.id.to_string(),
                name: format!("(Spectator #{index})"),
                email: None,
                photo: None,
                online: true,
            });
        online.push(user);
    }
    let mut list = online;
    if let Ok(Some(access)) = db::access(&state.db, session_id).await {
        for visitor in access.visitor_ids {
            if list.iter().any(|user| user.id == visitor) {
                continue;
            }
            if let Ok(Some(user)) = db::user_by_id(&state.db, &visitor, false).await {
                list.push(Participant {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    photo: user.photo,
                    online: false,
                });
            }
        }
    }
    let _ = socket.emit(RECEIVE_CLIENT_LIST, &list);
    broadcast(socket, session_id, RECEIVE_CLIENT_LIST, &list);
}

fn presence() -> Presence {
    Presence::default()
}
