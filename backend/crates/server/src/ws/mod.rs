//! Socket.IO board events. Names match `backend/src/common/actions.ts`.

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::{json, Value};
use socketioxide::adapter::Adapter;
use socketioxide::extract::{Data, SocketRef, State};
use socketioxide::SocketIo;
use socketioxide_core::adapter::DefinedAdapter;
use tokio::sync::Mutex;

use crate::db::{self};
use crate::models::{FullUser, Participant, User, WsError};
use crate::state::AppState;

pub(super) const ACK: &str = "retrospected/ack";
pub(super) const RECEIVE_POST: &str = "retrospected/posts/receive/add";
pub(super) const RECEIVE_DELETE_POST: &str = "retrospected/posts/receive/delete";
pub(super) const RECEIVE_EDIT_POST: &str = "retrospected/posts/receive/edit";
pub(super) const RECEIVE_LIKE: &str = "retrospected/posts/receive/like";
pub(super) const RECEIVE_CANCEL_VOTES: &str = "retrospected/posts/receive/cancel-votes";
pub(super) const RECEIVE_REACT: &str = "retrospected/posts/receive/react";
pub(super) const RECEIVE_POST_GROUP: &str = "retrospected/group/receive/add";
pub(super) const RECEIVE_DELETE_POST_GROUP: &str = "retrospected/group/receive/delete";
pub(super) const RECEIVE_EDIT_POST_GROUP: &str = "retrospected/group/receive/edit";
pub(super) const RECEIVE_BOARD: &str = "retrospected/posts/receive-all";
pub(super) const RECEIVE_SESSION_SETTINGS: &str = "retrospected/session/settings/receive";
pub(super) const RECEIVE_CLIENT_LIST: &str = "retrospected/session/receive/client-list";
pub(super) const RECEIVE_LOCK_SESSION: &str = "retrospected/session/receive/lock";
pub(super) const RECEIVE_UNAUTHORIZED: &str = "retrospected/session/receive/unauthorized";
pub(super) const RECEIVE_RATE_LIMITED: &str = "retrospected/rate-limited-error";
pub(super) const RECEIVE_ERROR: &str = "retrospected/receive/error";
pub(super) const RECEIVE_USER_READY: &str = "retrospected/receive/user-ready";
pub(super) const RECEIVE_CHAT: &str = "retrospected/session/chat/receive";
pub(super) const RECEIVE_TIMER_START: &str = "retrospected/timer/start/receive";
pub(super) const RECEIVE_TIMER_STOP: &str = "retrospected/timer/stop/receive";

#[derive(Clone, Default)]
pub(super) struct Presence(Arc<Mutex<HashMap<String, Option<User>>>>);

pub fn register<A>(io: &SocketIo<A>) -> A::InitRes
where
    A: Adapter + DefinedAdapter + 'static,
{
    let presence = presence();
    let presence = presence.clone();
    io.ns(
        "/",
        move |socket: SocketRef<A>, State(state): State<AppState>| {
            // Node Socket.IO puts every socket in a room named with its id, and OAuth
            // completion emits with `io.in(socketId)`. socketioxide does not do that,
            // so the `auth` event never arrived and the popup stayed on a blank page.
            socket.join(socket.id);
            log_connection(&socket, &state);
            let presence = presence.clone();
            let ids = ids_from_socket(&state, &socket);
            socket.extensions.insert(WsIds(ids.clone()));
            socket.on("retrospected/posts/add/success", {
                let presence = presence.clone();
                move |socket: SocketRef<A>,
                      Data(value): Data<Value>,
                      State(state): State<AppState>| {
                    let _ = &presence;
                    on_message(
                        socket,
                        state,
                        value,
                        false,
                        "retrospected/posts/add/success",
                        |state, ids, session_id, payload, socket| {
                            Box::pin(posts::add_post(state, ids, session_id, payload, socket))
                        },
                    );
                }
            });
            register_handlers(socket, state, presence);
        },
    )
}

fn register_handlers<A>(socket: SocketRef<A>, _state: AppState, presence: Presence)
where
    A: Adapter + DefinedAdapter + 'static,
{
    bind(&socket, "retrospected/posts/edit", false, posts::edit_post);
    bind(
        &socket,
        "retrospected/posts/delete",
        false,
        posts::delete_post,
    );
    bind(
        &socket,
        "retrospected/posts/like/success",
        false,
        posts::like_post,
    );
    bind(
        &socket,
        "retrospected/posts/cancel-votes/success",
        false,
        posts::cancel_votes,
    );
    bind(
        &socket,
        "retrospected/posts/react/success",
        false,
        posts::react_post,
    );
    bind(
        &socket,
        "retrospected/group/add/success",
        false,
        groups::add_group,
    );
    bind(
        &socket,
        "retrospected/group/edit",
        false,
        groups::edit_group,
    );
    bind(
        &socket,
        "retrospected/group/delete",
        false,
        groups::delete_group,
    );
    bind(&socket, "retrospected/session/chat", false, session::chat);
    bind(
        &socket,
        "retrospected/timer/start",
        false,
        session::start_timer,
    );
    bind(
        &socket,
        "retrospected/timer/stop",
        false,
        session::stop_timer,
    );
    bind(&socket, "retrospected/session/join", false, session::join);
    bind(
        &socket,
        "retrospected/session/request",
        false,
        session::request_board,
    );
    bind(&socket, "retrospected/session/leave", false, session::leave);
    bind(&socket, "retrospected/user-ready", false, session::ready);
    bind(
        &socket,
        "retrospected/session/settings/save",
        false,
        session::settings,
    );
    bind(&socket, "retrospected/session/lock", true, session::lock);
    let presence_disconnect = presence.clone();
    socket.on_disconnect(
        move |socket: SocketRef<A>,
              State(state): State<AppState>,
              _: socketioxide::socket::DisconnectReason| {
            let presence = presence_disconnect.clone();
            async move {
                let ip = peer_ip(socket.req_parts());
                crate::log::ws_disconnect(&socket.id.to_string(), &ip);
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

fn bind<A>(
    socket: &SocketRef<A>,
    event: &'static str,
    only_author: bool,
    handler: fn(
        AppState,
        Option<(String, String)>,
        String,
        Value,
        SocketRef<A>,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>>,
) where
    A: Adapter + DefinedAdapter + 'static,
{
    socket.on(
        event,
        move |socket: SocketRef<A>, Data(value): Data<Value>, State(state): State<AppState>| {
            on_message(socket, state, value, only_author, event, handler);
        },
    );
}

fn on_message<A>(
    socket: SocketRef<A>,
    state: AppState,
    value: Value,
    only_author: bool,
    event: &'static str,
    handler: fn(
        AppState,
        Option<(String, String)>,
        String,
        Value,
        SocketRef<A>,
    ) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send>>,
) where
    A: Adapter + DefinedAdapter + 'static,
{
    tokio::spawn(async move {
        crate::log::ws_in(event, &value);
        let ack = value
            .get("ack")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        emit_self(&socket, ACK, &ack);
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
            crate::log::ws_limited(&session_id);
            emit_self(&socket, RECEIVE_RATE_LIMITED, &json!({}));
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

async fn load_ids<A: Adapter>(state: &AppState, socket: &SocketRef<A>) -> Option<(String, String)> {
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
pub(super) struct WsIds(Option<(String, String)>);

#[derive(Clone)]
pub(super) struct BoardRoom(String);

fn ids_from_socket<A: Adapter>(
    state: &AppState,
    socket: &SocketRef<A>,
) -> Option<(String, String)> {
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

pub(super) fn emit_error<A: Adapter>(
    socket: &SocketRef<A>,
    kind: &'static str,
    details: Option<String>,
) {
    emit_self(socket, RECEIVE_ERROR, &WsError { kind, details });
}

pub(super) fn emit_self<A: Adapter>(
    socket: &SocketRef<A>,
    event: &str,
    data: &impl serde::Serialize,
) {
    crate::log::ws_out(event, data, false);
    let _ = socket.emit(event, data);
}

pub(super) fn room(session_id: &str) -> String {
    format!("board-{session_id}")
}

pub(super) async fn broadcast<A: Adapter>(
    socket: &SocketRef<A>,
    session_id: &str,
    event: &str,
    data: &impl serde::Serialize,
) {
    crate::log::ws_out(event, data, true);
    if let Err(error) = socket.to(room(session_id)).emit(event, data).await {
        tracing::debug!(%error, "board broadcast failed");
    }
}

fn peer_ip(parts: &axum::http::request::Parts) -> String {
    parts
        .headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
        .or_else(|| {
            parts
                .extensions
                .get::<std::net::SocketAddr>()
                .map(|addr| addr.ip().to_string())
        })
        .unwrap_or_else(|| "-".into())
}

fn log_connection<A: Adapter>(socket: &SocketRef<A>, state: &AppState) {
    let id = socket.id.to_string();
    let ip = peer_ip(socket.req_parts());
    let cookie = socket
        .req_parts()
        .headers
        .get(axum::http::header::COOKIE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let state = state.clone();
    tokio::spawn(async move {
        let who = if let Some(cookie) = cookie.as_deref() {
            if let Some(sid) = state.sessions.from_cookie(Some(cookie)) {
                state
                    .sessions
                    .load(&sid)
                    .await
                    .and_then(|session| session.user_ids())
                    .map(|(_, identity)| identity)
            } else {
                None
            }
        } else {
            None
        };
        crate::log::ws_connect(&id, &ip, who.as_deref().unwrap_or("anon"));
    });
}

mod groups;
mod posts;
mod session;

#[derive(Clone)]
pub(super) struct OnlineUser(User);

pub(super) fn user_summary(user: &FullUser) -> User {
    User {
        id: user.id.clone(),
        name: user.name.clone(),
        photo: user.photo.clone(),
        email: user.email.clone(),
    }
}

pub(super) async fn send_clients<A: Adapter>(
    _state: &AppState,
    _presence: &Presence,
    socket: &SocketRef<A>,
    session_id: &str,
) {
    send_clients_simple(_state, socket, session_id).await;
}

pub(super) async fn send_clients_simple<A: Adapter>(
    state: &AppState,
    socket: &SocketRef<A>,
    session_id: &str,
) {
    let sockets = socket.within(room(session_id)).sockets();
    let local_ids: std::collections::HashSet<String> =
        sockets.iter().map(|peer| peer.id.to_string()).collect();
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
    if let Ok(remote) = socket.within(room(session_id)).fetch_sockets().await {
        for peer in remote {
            let id = peer.data().id.to_string();
            if local_ids.contains(&id) {
                continue;
            }
            online.push(Participant {
                id,
                name: "(Spectator)".into(),
                email: None,
                photo: None,
                online: true,
            });
        }
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
    emit_self(socket, RECEIVE_CLIENT_LIST, &list);
    broadcast(socket, session_id, RECEIVE_CLIENT_LIST, &list).await;
}

pub(super) fn presence() -> Presence {
    Presence::default()
}
