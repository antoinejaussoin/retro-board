import { Actions } from './common/index.js';
import type {
  Post,
  PostGroup,
  Participant,
  UnauthorizedAccessPayload,
  WsUserData,
  WsLikeUpdatePayload,
  WsPostUpdatePayload,
  WsDeletePostPayload,
  WsDeleteGroupPayload,
  WsReceiveLikeUpdatePayload,
  WsErrorType,
  Session,
  WsErrorPayload,
  WebsocketMessage,
  WsGroupUpdatePayload,
  WsUserReadyPayload,
  Message,
  WsCancelVotesPayload,
  WsReceiveCancelVotesPayload,
  WsReceiveTimerStartPayload,
  WsSaveSessionSettingsPayload,
  SessionSettings,
} from './common/index.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import chalk from 'chalk-template';
import moment from 'moment';
import type { Server, Socket } from 'socket.io';
import type { SessionEntity, UserView } from './db/entities/index.js';
import { hasField } from './security/payload-checker.js';
import {
  getSession,
  updateOptions,
  updateColumns,
  updateName,
  storeVisitor,
  getSessionWithVisitors,
  toggleSessionLock,
  isAllowed,
  saveTemplate,
  doesSessionExists,
  wasSessionCreatedBy,
  toggleReady,
  updateModerator,
} from './db/actions/sessions.js';
import { getUser, getUserView } from './db/actions/users.js';
import {
  savePost,
  savePostGroup,
  deletePost,
  deletePostGroup,
  updatePost,
  updatePostGroup,
} from './db/actions/posts.js';
import config from './config.js';
import { cancelVotes, registerVote } from './db/actions/votes.js';
import { deserialiseIds } from './utils.js';
import type { UserIds } from './utils.js';
import { QueryFailedError } from 'typeorm';
import { saveChatMessage } from './db/actions/chat.js';
import { startTimer, stopTimer } from './db/actions/timer.js';
import { differenceInSeconds } from 'date-fns';

const {
  ACK,
  RECEIVE_POST,
  RECEIVE_POST_GROUP,
  RECEIVE_BOARD,
  RECEIVE_DELETE_POST,
  RECEIVE_LIKE,
  RECEIVE_EDIT_POST,
  RECEIVE_DELETE_POST_GROUP,
  RECEIVE_EDIT_POST_GROUP,
  RECEIVE_USER_READY,
  USER_READY,
  ADD_POST_SUCCESS,
  ADD_POST_GROUP_SUCCESS,
  DELETE_POST,
  LIKE_SUCCESS,
  CANCEL_VOTES_SUCCESS,
  RECEIVE_CANCEL_VOTES,
  EDIT_POST,
  DELETE_POST_GROUP,
  EDIT_POST_GROUP,
  RECEIVE_CLIENT_LIST,
  JOIN_SESSION,
  LEAVE_SESSION,
  SAVE_SESSION_SETTINGS,
  LOCK_SESSION,
  RECEIVE_LOCK_SESSION,
  RECEIVE_UNAUTHORIZED,
  RECEIVE_RATE_LIMITED,
  RECEIVE_ERROR,
  REQUEST_BOARD,
  CHAT_MESSAGE,
  RECEIVE_CHAT_MESSAGE,
  START_TIMER,
  STOP_TIMER,
  RECEIVE_TIMER_START,
  RECEIVE_TIMER_STOP,
  RECEIVE_SESSION_SETTINGS,
} = Actions;

interface Users {
  [socketId: string]: UserView | null;
}

const rateLimiter = new RateLimiterMemory({
  points: config.RATE_LIMIT_WS_POINTS,
  duration: config.RATE_LIMIT_WS_DURATION,
});

const s = (str: string) => chalk`{blue ${str.replace('retrospected/', '')}}`;

export default (io: Server) => {
  const users: Users = {};
  const d = () => chalk`{yellow [${moment().format('D/M HH:mm:ss')}]} `;

  const getRoom = (sessionId: string) => `board-${sessionId}`;

  function sendToAll<T>(
    socket: Socket,
    sessionId: string,
    action: string,
    data: T,
  ) {
    console.log(
      chalk`${d()}{green  ==> } ${s(action)} {grey ${JSON.stringify(data)}}`,
    );
    if (hasField('password', data)) {
      console.error('The following object has a password property: ', data);
    }
    socket.broadcast.to(getRoom(sessionId)).emit(action, data);
  }

  function sendToSelf<T>(socket: Socket, action: string, data: T) {
    console.log(
      chalk`${d()}{green  --> } ${s(action)} {grey ${JSON.stringify(data)}}`,
    );
    if (hasField('password', data)) {
      console.error('The following object has a password property: ', data);
    }
    socket.emit(action, data);
  }

  const sendClientList = async (session: SessionEntity, socket: Socket) => {
    const roomId = getRoom(session.id);
    const sockets = Array.from(await io.of('/').in(roomId).allSockets());

    if (sockets) {
      const onlineParticipants: Participant[] = sockets
        .map((socket, i) =>
          users[socket]
            ? users[socket].toJson()
            : {
                id: socket,
                name: `(Spectator #${i})`,
                email: null,
                photo: null,
                pro: null,
              },
        )
        .map((user) => ({ ...user, online: true }));
      const onlineParticipantsIds = onlineParticipants.map((p) => p.id);

      const offlineParticipants: Participant[] = session.visitors
        ? session.visitors
            .filter((op) => !onlineParticipantsIds.includes(op.id))
            .map((op) => ({ ...op.toJson(), online: false }))
        : [];

      sendToSelf<Participant[]>(socket, RECEIVE_CLIENT_LIST, [
        ...onlineParticipants,
        ...offlineParticipants,
      ]);
      sendToAll<Participant[]>(socket, session.id, RECEIVE_CLIENT_LIST, [
        ...onlineParticipants,
        ...offlineParticipants,
      ]);
    }
  };

  const recordUser = (
    session: SessionEntity,
    user: UserView,
    socket: Socket,
  ) => {
    const socketId = socket.id;
    if (!users[socketId] || users[socketId].id !== user.id) {
      users[socketId] = user || null;
    }

    sendClientList(session, socket);
  };

  function sendToAllOrError<T>(
    socket: Socket,
    sessionId: string,
    action: string,
    errorType: WsErrorType,
    data: T | null,
  ) {
    if (data === null) {
      sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
        details: null,
        type: errorType,
      });
    } else {
      sendToAll<T>(socket, sessionId, action, data);
    }
  }

  /**
   * Check that UserIds is not null
   * @param userIds User IDs
   * @param socket Socket
   * @returns Whether User is not null
   */
  function checkUser(
    userIds: UserIds | null,
    socket: Socket,
  ): userIds is Exclude<UserIds, null> {
    if (!userIds) {
      sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
        details: 'User not authenticated',
        type: 'action_unauthorised',
      });
      return false;
    }
    return true;
  }

  const onAddPost = async (
    userIds: UserIds | null,
    sessionId: string,
    post: Post,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const createdPost = await savePost(userIds.userId, sessionId, post);
      sendToAllOrError<Post>(
        socket,
        sessionId,
        RECEIVE_POST,
        'cannot_save_post',
        createdPost,
      );
    }
  };

  const onChatMessage = async (
    userIds: UserIds | null,
    sessionId: string,
    message: Message,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const createdMessage = await saveChatMessage(
        userIds.userId,
        sessionId,
        message,
      );
      sendToAllOrError<Message>(
        socket,
        sessionId,
        RECEIVE_CHAT_MESSAGE,
        'cannot_record_chat_message',
        createdMessage,
      );
    }
  };

  const onAddPostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    group: PostGroup,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const createdGroup = await savePostGroup(
        userIds.userId,
        sessionId,
        group,
      );
      sendToAllOrError<PostGroup>(
        socket,
        sessionId,
        RECEIVE_POST_GROUP,
        'cannot_save_group',
        createdGroup,
      );
    }
  };

  const log = (msg: string) => {
    console.log(d() + msg);
  };

  const onRequestBoard = async (
    _userIds: UserIds | null,
    sessionId: string,
    _payload: undefined,
    socket: Socket,
  ) => {
    const session = await getSession(sessionId);
    if (session) {
      sendToSelf<Session>(socket, RECEIVE_BOARD, session);
    } else {
      sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
        type: 'cannot_get_session',
        details: null,
      });
    }
  };

  const onJoinSession = async (
    userIds: UserIds | null,
    sessionId: string,
    _: WsUserData,
    socket: Socket,
  ) => {
    await socket.join(getRoom(sessionId));
    socket.data.sessionId = sessionId;
    const user = userIds ? await getUserView(userIds.identityId) : null;
    const sessionEntity = await getSessionWithVisitors(sessionId);

    if (sessionEntity) {
      const userAllowed = isAllowed(sessionEntity, user);
      if (userAllowed.allowed) {
        if (user) {
          const userEntity = await getUser(user.id);
          if (userEntity) {
            // TODO : inefficient, rework all this
            await storeVisitor(sessionId, userEntity);
            const sessionEntity2 = await getSessionWithVisitors(sessionId);
            if (sessionEntity2) {
              recordUser(sessionEntity2, user, socket);
            }
          }
        } else {
          sendClientList(sessionEntity, socket);
        }
        const session = await getSession(sessionId);
        if (session) {
          sendToSelf<Session>(socket, RECEIVE_BOARD, session);
          if (session.timer) {
            sendToSelf<WsReceiveTimerStartPayload>(
              socket,
              RECEIVE_TIMER_START,
              {
                duration: differenceInSeconds(session.timer, new Date()),
              },
            );
          }
        } else {
          sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
            type: 'cannot_get_session',
            details: null,
          });
        }
      } else {
        log(chalk`{red User not allowed, session locked}`);
        const payload: UnauthorizedAccessPayload = {
          type: userAllowed.reason,
          session:
            userAllowed.reason === 'locked'
              ? sessionEntity.toJson()
              : undefined,
        };
        sendToSelf<UnauthorizedAccessPayload>(
          socket,
          RECEIVE_UNAUTHORIZED,
          payload,
        );
        socket.disconnect();
      }
    }
  };

  const onLeaveSession = async (
    _userIds: UserIds | null,
    sessionId: string,
    _data: unknown,
    socket: Socket,
  ) => {
    await socket.leave(getRoom(sessionId));
    const sessionEntity = await getSessionWithVisitors(sessionId);
    if (sessionEntity) {
      sendClientList(sessionEntity, socket);
    }
  };

  const onUserReady = async (
    userIds: UserIds | null,
    sessionId: string,
    _data: unknown,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const ready = await toggleReady(sessionId, userIds.userId);
      const user = await getUser(userIds.userId);
      sendToAll<WsUserReadyPayload>(socket, sessionId, RECEIVE_USER_READY, {
        userId: userIds.userId,
        name: user ? user.name : 'Somebody',
        ready,
      });
    }
  };

  const onDeletePost = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsDeletePostPayload,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const success = await deletePost(userIds.userId, sessionId, data.postId);
      sendToAllOrError<WsDeletePostPayload>(
        socket,
        sessionId,
        RECEIVE_DELETE_POST,
        'cannot_delete_post',
        success ? data : null,
      );
    }
  };

  const onDeletePostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsDeleteGroupPayload,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const success = await deletePostGroup(
        userIds.userId,
        sessionId,
        data.groupId,
      );
      sendToAllOrError<WsDeleteGroupPayload>(
        socket,
        sessionId,
        RECEIVE_DELETE_POST_GROUP,
        'cannot_delete_group',
        success ? data : null,
      );
    }
  };

  const onLikePost = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsLikeUpdatePayload,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const vote = await registerVote(
        userIds.userId,
        sessionId,
        data.postId,
        data.type,
      );

      sendToAllOrError<WsReceiveLikeUpdatePayload>(
        socket,
        sessionId,
        RECEIVE_LIKE,
        'cannot_register_vote',
        vote
          ? {
              postId: data.postId,
              vote,
            }
          : null,
      );
    }
  };

  const onCancelVotes = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsCancelVotesPayload,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      await cancelVotes(userIds.userId, sessionId, data.postId);

      sendToAllOrError<WsReceiveCancelVotesPayload>(
        socket,
        sessionId,
        RECEIVE_CANCEL_VOTES,
        'cannot_cancel_votes',
        {
          postId: data.postId,
          userId: userIds.userId,
        },
      );
    }
  };

  const onEditPost = async (
    _userIds: UserIds | null,
    sessionId: string,
    data: WsPostUpdatePayload,
    socket: Socket,
  ) => {
    const persistedPost = await updatePost(sessionId, data.post, data.groupId);
    sendToAllOrError<Post>(
      socket,
      sessionId,
      RECEIVE_EDIT_POST,
      'cannot_edit_post',
      persistedPost,
    );
  };

  const onEditPostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsGroupUpdatePayload,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const group = await updatePostGroup(
        userIds.userId,
        sessionId,
        data.group,
      );
      sendToAllOrError<PostGroup>(
        socket,
        sessionId,
        RECEIVE_EDIT_POST_GROUP,
        'cannot_edit_group',
        group,
      );
    }
  };

  const onSaveSessionSettings = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsSaveSessionSettingsPayload,
    socket: Socket,
  ) => {
    if (data.settings.options !== undefined) {
      await updateOptions(sessionId, data.settings.options);
    }

    if (data.settings.columns !== undefined) {
      await updateColumns(sessionId, data.settings.columns);
    }

    if (data.settings.name !== undefined) {
      await updateName(sessionId, data.settings.name || '');
    }

    if (data.settings.moderator !== undefined) {
      await updateModerator(sessionId, data.settings.moderator.id);
    }

    if (checkUser(userIds, socket) && data.saveAsTemplate) {
      if (data.settings.columns && data.settings.options) {
        await saveTemplate(
          userIds.userId,
          data.settings.columns,
          data.settings.options,
        );
      }
    }
    sendToAllOrError<SessionSettings>(
      socket,
      sessionId,
      RECEIVE_SESSION_SETTINGS,
      'cannot_save_session_settings',
      data.settings,
    );
  };

  const onLockSession = async (
    _userIds: UserIds | null,
    sessionId: string,
    locked: boolean,
    socket: Socket,
  ) => {
    await toggleSessionLock(sessionId, locked);
    sendToAll<boolean>(socket, sessionId, RECEIVE_LOCK_SESSION, locked);
  };

  const onStartTimer = async (
    userIds: UserIds | null,
    sessionId: string,
    _: unknown,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      const duration = await startTimer(sessionId);
      sendToAll<WsReceiveTimerStartPayload>(
        socket,
        sessionId,
        RECEIVE_TIMER_START,
        { duration },
      );
    }
  };

  const onStopTimer = async (
    userIds: UserIds | null,
    sessionId: string,
    _: unknown,
    socket: Socket,
  ) => {
    if (checkUser(userIds, socket)) {
      await stopTimer(sessionId);
      sendToAll<undefined>(socket, sessionId, RECEIVE_TIMER_STOP, undefined);
    }
  };

  io.on('connection', async (socket) => {
    const ip =
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (socket.handshake as any).headers['x-forwarded-for'] ||
      socket.handshake.address;
    // biome-ignore lint/suspicious/noExplicitAny: Temporary
    const idsAsString: string | undefined = (socket.request as any).session
      ?.passport?.user;

    const ids = idsAsString ? deserialiseIds(idsAsString) : null;
    socket.data.identityId = ids?.identityId;

    console.log(
      d() +
        chalk`{blue Connection: {red New user connected} {grey ${
          socket.id
        } ${ip} ${ids?.identityId ? ids?.identityId : 'anon'}}}`,
    );

    type ActionHandler = (
      ids: UserIds | null,
      sessionId: string,
      // biome-ignore lint/suspicious/noExplicitAny: Temporary
      data: any,
      socket: Socket,
    ) => Promise<void>;

    interface Action {
      type: string;
      handler: ActionHandler;
      onlyAuthor?: boolean;
    }

    const actions: Action[] = [
      { type: ADD_POST_SUCCESS, handler: onAddPost },
      { type: EDIT_POST, handler: onEditPost },
      { type: DELETE_POST, handler: onDeletePost },
      { type: LIKE_SUCCESS, handler: onLikePost },
      { type: CANCEL_VOTES_SUCCESS, handler: onCancelVotes },

      { type: ADD_POST_GROUP_SUCCESS, handler: onAddPostGroup },
      { type: EDIT_POST_GROUP, handler: onEditPostGroup },
      { type: DELETE_POST_GROUP, handler: onDeletePostGroup },

      { type: CHAT_MESSAGE, handler: onChatMessage },

      { type: START_TIMER, handler: onStartTimer },
      { type: STOP_TIMER, handler: onStopTimer },

      { type: JOIN_SESSION, handler: onJoinSession },
      { type: REQUEST_BOARD, handler: onRequestBoard },
      { type: LEAVE_SESSION, handler: onLeaveSession },
      { type: USER_READY, handler: onUserReady },
      { type: SAVE_SESSION_SETTINGS, handler: onSaveSessionSettings },
      { type: LOCK_SESSION, handler: onLockSession, onlyAuthor: true },
    ];

    for (const action of actions) {
      socket.on(action.type, async (data: WebsocketMessage<unknown>) => {
        const sid =
          action.type === LEAVE_SESSION
            ? socket.data.sessionId
            : data.sessionId;

        sendToSelf(socket, ACK, data.ack);

        try {
          console.log(
            chalk`${d()}{red  <-- } ${s(action.type)} {grey ${JSON.stringify(
              data,
            )}}`,
          );
          await rateLimiter.consume(sid);

          if (sid) {
            const exists = await doesSessionExists(sid);
            if (exists) {
              try {
                if (action.onlyAuthor) {
                  if (!ids || !(await wasSessionCreatedBy(sid, ids.userId))) {
                    sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
                      type: 'action_unauthorised',
                      details: null,
                    });
                    return;
                  }
                }
                await action.handler(ids, sid, data.payload, socket);
              } catch (err) {
                if (err instanceof QueryFailedError) {
                  console.error(err);
                }
                sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
                  type: 'unknown_error',
                  details: null,
                });
              }
            } else {
              sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
                type: 'cannot_get_session',
                details: null,
              });
            }
          }
        } catch (_rejection) {
          // https://stackoverflow.com/questions/22110010/node-socket-io-anything-to-prevent-flooding/23548884
          console.error(
            chalk`${d()} {red Websocket has been rate limited for user {yellow ${
              ids?.identityId
            }} and SID {yellow ${sid}}}`,
          );
          socket.emit(RECEIVE_RATE_LIMITED);
        }
      });
    }

    socket.on('disconnect', async () => {
      if (socket.data.sessionId) {
        console.log(
          chalk`${d()}{blue Disconnection: }{red User left} {grey ${
            socket.id
          } ${ip}}`,
        );
        const sessionEntity = await getSessionWithVisitors(
          socket.data.sessionId,
        );
        if (sessionEntity) {
          sendClientList(sessionEntity, socket);
        }
      }
    });
  });
};
