import {
  Actions,
  Post,
  PostGroup,
  Participant,
  ColumnDefinition,
  UnauthorizedAccessPayload,
  WsUserData,
  WsNameData,
  WsLikeUpdatePayload,
  WsPostUpdatePayload,
  WsDeletePostPayload,
  WsDeleteGroupPayload,
  WsSaveTemplatePayload,
  WsReceiveLikeUpdatePayload,
  WsErrorType,
  Session,
  SessionOptions,
  WsErrorPayload,
  WebsocketMessage,
  WsGroupUpdatePayload,
  WsUserReadyPayload,
  Message,
} from './common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import chalk from 'chalk';
import moment from 'moment';
import { Server, Socket } from 'socket.io';
import {
  setScope,
  reportQueryError,
  throttledManualReport,
  manualMessage,
} from './sentry';
import { SessionEntity, UserView } from './db/entities';
import { hasField } from './security/payload-checker';
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
} from './db/actions/sessions';
import { getUser, getUserView } from './db/actions/users';
import {
  savePost,
  savePostGroup,
  deletePost,
  deletePostGroup,
  updatePost,
  updatePostGroup,
} from './db/actions/posts';
import config from './config';
import { registerVote } from './db/actions/votes';
import { deserialiseIds, UserIds } from './utils';
import { QueryFailedError } from 'typeorm';
import { saveChatMessage } from './db/actions/chat';

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
  EDIT_POST,
  DELETE_POST_GROUP,
  EDIT_POST_GROUP,
  RECEIVE_CLIENT_LIST,
  RECEIVE_SESSION_NAME,
  JOIN_SESSION,
  RENAME_SESSION,
  LEAVE_SESSION,
  EDIT_OPTIONS,
  RECEIVE_OPTIONS,
  EDIT_COLUMNS,
  RECEIVE_COLUMNS,
  SAVE_TEMPLATE,
  LOCK_SESSION,
  RECEIVE_LOCK_SESSION,
  RECEIVE_UNAUTHORIZED,
  RECEIVE_RATE_LIMITED,
  RECEIVE_ERROR,
  REQUEST_BOARD,
  CHAT_MESSAGE,
  RECEIVE_CHAT_MESSAGE,
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
  const d = () => chalk`{yellow [${moment().format('HH:mm:ss')}]} `;

  const getRoom = (sessionId: string) => `board-${sessionId}`;

  function sendToAll<T>(
    socket: Socket,
    sessionId: string,
    action: string,
    data: T
  ) {
    console.log(
      chalk`${d()}{green  ==> } ${s(action)} {grey ${JSON.stringify(data)}}`
    );
    if (hasField('password', data)) {
      console.error('The following object has a password property: ', data);
    }
    socket.broadcast.to(getRoom(sessionId)).emit(action, data);
  }

  function sendToSelf<T>(socket: Socket, action: string, data: T) {
    console.log(
      chalk`${d()}{green  --> } ${s(action)} {grey ${JSON.stringify(data)}}`
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
            ? users[socket]!.toJson()
            : {
                id: socket,
                name: `(Spectator #${i})`,
                photo: null,
                pro: null,
              }
        )
        .map((user) => ({ ...user, online: true }));
      const onlineParticipantsIds = onlineParticipants.map((p) => p.id);

      const offlineParticipants: Participant[] = session
        .visitors!.filter((op) => !onlineParticipantsIds.includes(op.id))
        .map((op) => ({ ...op.toJson(), online: false }));

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
    socket: Socket
  ) => {
    const socketId = socket.id;
    if (!users[socketId] || users[socketId]!.id !== user.id) {
      users[socketId] = user || null;
    }

    sendClientList(session, socket);
  };

  function sendToAllOrError<T>(
    socket: Socket,
    sessionId: string,
    action: string,
    errorType: WsErrorType,
    data: T | null
  ) {
    if (data === null) {
      sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
        details: null,
        type: errorType,
      });
      manualMessage(errorType);
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
    socket: Socket
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
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const createdPost = await savePost(userIds.userId, sessionId, post);
      sendToAllOrError<Post>(
        socket,
        sessionId,
        RECEIVE_POST,
        'cannot_save_post',
        createdPost
      );
    }
  };

  const onChatMessage = async (
    userIds: UserIds | null,
    sessionId: string,
    message: Message,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const createdMessage = await saveChatMessage(
        userIds.userId,
        sessionId,
        message
      );
      sendToAllOrError<Message>(
        socket,
        sessionId,
        RECEIVE_CHAT_MESSAGE,
        'cannot_record_chat_message',
        createdMessage
      );
    }
  };

  const onAddPostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    group: PostGroup,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const createdGroup = await savePostGroup(
        userIds.userId,
        sessionId,
        group
      );
      sendToAllOrError<PostGroup>(
        socket,
        sessionId,
        RECEIVE_POST_GROUP,
        'cannot_save_group',
        createdGroup
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
    socket: Socket
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
    socket: Socket
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
            // TODO : inneficient, rework all this
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
        };
        sendToSelf<UnauthorizedAccessPayload>(
          socket,
          RECEIVE_UNAUTHORIZED,
          payload
        );
        socket.disconnect();
      }
    }
  };

  const onRenameSession = async (
    _userIds: UserIds | null,
    sessionId: string,
    data: WsNameData,
    socket: Socket
  ) => {
    const success = await updateName(sessionId, data.name);
    sendToAllOrError<string>(
      socket,
      sessionId,
      RECEIVE_SESSION_NAME,
      'cannot_rename_session',
      success ? data.name : null
    );
  };

  const onLeaveSession = async (
    _userIds: UserIds | null,
    sessionId: string,
    _data: void,
    socket: Socket
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
    _data: void,
    socket: Socket
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
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const success = await deletePost(userIds.userId, sessionId, data.postId);
      sendToAllOrError<WsDeletePostPayload>(
        socket,
        sessionId,
        RECEIVE_DELETE_POST,
        'cannot_delete_post',
        success ? data : null
      );
    }
  };

  const onDeletePostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsDeleteGroupPayload,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const success = await deletePostGroup(
        userIds.userId,
        sessionId,
        data.groupId
      );
      sendToAllOrError<WsDeleteGroupPayload>(
        socket,
        sessionId,
        RECEIVE_DELETE_POST_GROUP,
        'cannot_delete_group',
        success ? data : null
      );
    }
  };

  const onLikePost = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsLikeUpdatePayload,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const vote = await registerVote(
        userIds.userId,
        sessionId,
        data.postId,
        data.type
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
          : null
      );
    }
  };

  const onEditPost = async (
    _userIds: UserIds | null,
    sessionId: string,
    data: WsPostUpdatePayload,
    socket: Socket
  ) => {
    const persistedPost = await updatePost(sessionId, data.post, data.groupId);
    sendToAllOrError<Post>(
      socket,
      sessionId,
      RECEIVE_EDIT_POST,
      'cannot_edit_post',
      persistedPost
    );
  };

  const onEditPostGroup = async (
    userIds: UserIds | null,
    sessionId: string,
    data: WsGroupUpdatePayload,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      const group = await updatePostGroup(
        userIds.userId,
        sessionId,
        data.group
      );
      sendToAllOrError<PostGroup>(
        socket,
        sessionId,
        RECEIVE_EDIT_POST_GROUP,
        'cannot_edit_group',
        group
      );
    }
  };

  const onEditOptions = async (
    _userIds: UserIds | null,
    sessionId: string,
    data: SessionOptions,
    socket: Socket
  ) => {
    const options = await updateOptions(sessionId, data);
    sendToAllOrError<SessionOptions>(
      socket,
      sessionId,
      RECEIVE_OPTIONS,
      'cannot_save_options',
      options
    );
  };

  const onEditColumns = async (
    _userIds: UserIds | null,
    sessionId: string,
    data: ColumnDefinition[],
    socket: Socket
  ) => {
    const columns = await updateColumns(sessionId, data);
    sendToAllOrError<ColumnDefinition[]>(
      socket,
      sessionId,
      RECEIVE_COLUMNS,
      'cannot_save_columns',
      columns
    );
  };

  const onSaveTemplate = async (
    userIds: UserIds | null,
    _sessionId: string,
    data: WsSaveTemplatePayload,
    socket: Socket
  ) => {
    if (checkUser(userIds, socket)) {
      await saveTemplate(userIds.userId, data.columns, data.options);
    }
  };

  const onLockSession = async (
    _userIds: UserIds | null,
    sessionId: string,
    locked: boolean,
    socket: Socket
  ) => {
    await toggleSessionLock(sessionId, locked);
    sendToAll<boolean>(socket, sessionId, RECEIVE_LOCK_SESSION, locked);
  };

  io.on('connection', async (socket) => {
    const ip =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket.handshake as any).headers['x-forwarded-for'] ||
      socket.handshake.address;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idsAsString: string | undefined = (socket.request as any).session
      ?.passport?.user;

    const ids = idsAsString ? deserialiseIds(idsAsString) : null;
    socket.data.identityId = ids?.identityId;

    console.log(
      d() +
        chalk`{blue Connection: {red New user connected} {grey ${
          socket.id
        } ${ip} ${ids?.identityId ? ids?.identityId : 'anon'}}}`
    );

    type ActionHandler = (
      ids: UserIds | null,
      sessionId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any,
      socket: Socket
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

      { type: ADD_POST_GROUP_SUCCESS, handler: onAddPostGroup },
      { type: EDIT_POST_GROUP, handler: onEditPostGroup },
      { type: DELETE_POST_GROUP, handler: onDeletePostGroup },

      { type: CHAT_MESSAGE, handler: onChatMessage },

      { type: JOIN_SESSION, handler: onJoinSession },
      { type: REQUEST_BOARD, handler: onRequestBoard },
      { type: RENAME_SESSION, handler: onRenameSession },
      { type: LEAVE_SESSION, handler: onLeaveSession },
      { type: USER_READY, handler: onUserReady },
      { type: EDIT_OPTIONS, handler: onEditOptions, onlyAuthor: true },
      { type: EDIT_COLUMNS, handler: onEditColumns, onlyAuthor: true },
      { type: SAVE_TEMPLATE, handler: onSaveTemplate, onlyAuthor: true },
      { type: LOCK_SESSION, handler: onLockSession, onlyAuthor: true },
    ];

    actions.forEach((action) => {
      socket.on(action.type, async (data: WebsocketMessage<unknown>) => {
        const sid =
          action.type === LEAVE_SESSION
            ? socket.data.sessionId
            : data.sessionId;

        sendToSelf(socket, ACK, data.ack);

        try {
          console.log(
            chalk`${d()}{red  <-- } ${s(action.type)} {grey ${JSON.stringify(
              data
            )}}`
          );
          await rateLimiter.consume(sid);
          setScope(async (scope) => {
            if (scope) {
              scope.setUser({ id: ids?.userId });
              scope.setExtra('action', action.type);
              scope.setExtra('session', sid);
            }
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
                    reportQueryError(scope, err);
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
          });
        } catch (rejection) {
          // https://stackoverflow.com/questions/22110010/node-socket-io-anything-to-prevent-flooding/23548884
          console.error(
            chalk`${d()} {red Websocket has been rate limited for user {yellow ${
              ids?.identityId
            }} and SID {yellow ${sid}}}`
          );
          throttledManualReport('websocket is being throttled', undefined);
          socket.emit(RECEIVE_RATE_LIMITED);
        }
      });
    });

    socket.on('disconnect', async () => {
      if (socket.data.sessionId) {
        console.log(
          chalk`${d()}{blue Disconnection: }{red User left} {grey ${
            socket.id
          } ${ip}}`
        );
        const sessionEntity = await getSessionWithVisitors(
          socket.data.sessionId
        );
        if (sessionEntity) {
          sendClientList(sessionEntity, socket);
        }
      }
    });
  });
};
