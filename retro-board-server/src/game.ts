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
} from '@retrospected/common';
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
import config from './db/config';
import { registerVote } from './db/actions/votes';

const {
  RECEIVE_POST,
  RECEIVE_POST_GROUP,
  RECEIVE_BOARD,
  RECEIVE_DELETE_POST,
  RECEIVE_LIKE,
  RECEIVE_EDIT_POST,
  RECEIVE_DELETE_POST_GROUP,
  RECEIVE_EDIT_POST_GROUP,
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
} = Actions;

interface ExtendedSocket extends Socket {
  sessionId: string;
  userId: string;
}

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
    socket: ExtendedSocket,
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

  function sendToSelf<T>(socket: ExtendedSocket, action: string, data: T) {
    console.log(
      chalk`${d()}{green  --> } ${s(action)} {grey ${JSON.stringify(data)}}`
    );
    if (hasField('password', data)) {
      console.error('The following object has a password property: ', data);
    }
    socket.emit(action, data);
  }

  const sendClientList = (session: SessionEntity, socket: ExtendedSocket) => {
    const roomId = getRoom(session.id);
    const allSockets = io.of('/').in(getRoom(session.id)).sockets; // That doesn't actually do what it's supposed to do

    if (allSockets) {
      const sockets = Array.from(allSockets.values());
      const roomSockets = sockets.filter((s) => s.rooms.has(roomId));
      const onlineParticipants: Participant[] = roomSockets
        .map((socket, i) =>
          users[socket.id]
            ? users[socket.id]!.toJson()
            : {
                id: socket.id,
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
    socket: ExtendedSocket
  ) => {
    const socketId = socket.id;
    if (!users[socketId] || users[socketId]!.id !== user.id) {
      users[socketId] = user || null;
    }

    sendClientList(session, socket);
  };

  function sendToAllOrError<T>(
    socket: ExtendedSocket,
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

  const onAddPost = async (
    userId: string,
    sessionId: string,
    post: Post,
    socket: ExtendedSocket
  ) => {
    const createdPost = await savePost(userId, sessionId, post);
    sendToAllOrError<Post>(
      socket,
      sessionId,
      RECEIVE_POST,
      'cannot_save_post',
      createdPost
    );
  };

  const onAddPostGroup = async (
    userId: string,
    sessionId: string,
    group: PostGroup,
    socket: ExtendedSocket
  ) => {
    const createdGroup = await savePostGroup(userId, sessionId, group);
    sendToAllOrError<PostGroup>(
      socket,
      sessionId,
      RECEIVE_POST_GROUP,
      'cannot_save_group',
      createdGroup
    );
  };

  const log = (msg: string) => {
    console.log(d() + msg);
  };

  const onRequestBoard = async (
    _userId: string,
    sessionId: string,
    _payload: undefined,
    socket: ExtendedSocket
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
    userId: string,
    sessionId: string,
    _: WsUserData,
    socket: ExtendedSocket
  ) => {
    await socket.join(getRoom(sessionId));
    socket.sessionId = sessionId;
    const user = userId ? await getUserView(userId) : null;
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
    _userId: string,
    sessionId: string,
    data: WsNameData,
    socket: ExtendedSocket
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
    _userId: string,
    sessionId: string,
    _data: void,
    socket: ExtendedSocket
  ) => {
    await socket.leave(getRoom(sessionId));
    const sessionEntity = await getSessionWithVisitors(sessionId);
    if (sessionEntity) {
      sendClientList(sessionEntity, socket);
    }
  };

  const onDeletePost = async (
    userId: string,
    sessionId: string,
    data: WsDeletePostPayload,
    socket: ExtendedSocket
  ) => {
    const success = await deletePost(userId, sessionId, data.postId);
    sendToAllOrError<WsDeletePostPayload>(
      socket,
      sessionId,
      RECEIVE_DELETE_POST,
      'cannot_delete_post',
      success ? data : null
    );
  };

  const onDeletePostGroup = async (
    userId: string,
    sessionId: string,
    data: WsDeleteGroupPayload,
    socket: ExtendedSocket
  ) => {
    const success = await deletePostGroup(userId, sessionId, data.groupId);
    sendToAllOrError<WsDeleteGroupPayload>(
      socket,
      sessionId,
      RECEIVE_DELETE_POST_GROUP,
      'cannot_delete_group',
      success ? data : null
    );
  };

  const onLikePost = async (
    userId: string,
    sessionId: string,
    data: WsLikeUpdatePayload,
    socket: ExtendedSocket
  ) => {
    const vote = await registerVote(userId, sessionId, data.postId, data.type);

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
  };

  const onEditPost = async (
    _userId: string,
    sessionId: string,
    data: WsPostUpdatePayload,
    socket: ExtendedSocket
  ) => {
    const persistedPost = await updatePost(sessionId, data.post);
    sendToAllOrError<Post>(
      socket,
      sessionId,
      RECEIVE_EDIT_POST,
      'cannot_edit_post',
      persistedPost
    );
  };

  const onEditPostGroup = async (
    userId: string,
    sessionId: string,
    data: PostGroup,
    socket: ExtendedSocket
  ) => {
    const group = await updatePostGroup(userId, sessionId, data);
    sendToAllOrError<PostGroup>(
      socket,
      sessionId,
      RECEIVE_EDIT_POST_GROUP,
      'cannot_edit_group',
      group
    );
  };

  const onEditOptions = async (
    _userId: string,
    sessionId: string,
    data: SessionOptions,
    socket: ExtendedSocket
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
    _userId: string,
    sessionId: string,
    data: ColumnDefinition[],
    socket: ExtendedSocket
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
    userId: string,
    _sessionId: string,
    data: WsSaveTemplatePayload,
    _socket: ExtendedSocket
  ) => {
    await saveTemplate(userId, data.columns, data.options);
  };

  const onLockSession = async (
    _: string,
    sessionId: string,
    locked: boolean,
    socket: ExtendedSocket
  ) => {
    await toggleSessionLock(sessionId, locked);
    sendToAll<boolean>(socket, sessionId, RECEIVE_LOCK_SESSION, locked);
  };

  io.on('connection', async (socket: ExtendedSocket) => {
    const ip =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket.handshake as any).headers['x-forwarded-for'] ||
      socket.handshake.address;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId: string = (socket.request as any).session?.passport?.user;
    socket.userId = userId;
    console.log(
      d() +
        chalk`{blue Connection: {red New user connected} {grey ${
          socket.id
        } ${ip} ${userId ? userId : 'anon'}}}`
    );

    type ActionHandler = (
      userId: string,
      sessionId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any,
      socket: ExtendedSocket
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

      { type: JOIN_SESSION, handler: onJoinSession },
      { type: REQUEST_BOARD, handler: onRequestBoard },
      { type: RENAME_SESSION, handler: onRenameSession },
      { type: LEAVE_SESSION, handler: onLeaveSession },
      { type: EDIT_OPTIONS, handler: onEditOptions, onlyAuthor: true },
      { type: EDIT_COLUMNS, handler: onEditColumns, onlyAuthor: true },
      { type: SAVE_TEMPLATE, handler: onSaveTemplate, onlyAuthor: true },
      { type: LOCK_SESSION, handler: onLockSession, onlyAuthor: true },
    ];

    actions.forEach((action) => {
      socket.on(action.type, async (data) => {
        // To remove
        // console.log('Message length: ', JSON.stringify(data).length);
        const sid =
          action.type === LEAVE_SESSION ? socket.sessionId : data.sessionId;

        try {
          console.log(
            chalk`${d()}{red  <-- } ${s(action.type)} {grey ${JSON.stringify(
              data
            )}}`
          );
          await rateLimiter.consume(sid);
          setScope(async (scope) => {
            if (scope) {
              scope.setUser({ id: userId });
              scope.setExtra('action', action.type);
              scope.setExtra('session', sid);
            }
            if (sid) {
              const exists = await doesSessionExists(sid);
              if (exists) {
                try {
                  if (action.onlyAuthor) {
                    if (!(await wasSessionCreatedBy(sid, userId))) {
                      sendToSelf<WsErrorPayload>(socket, RECEIVE_ERROR, {
                        type: 'action_unauthorised',
                        details: null,
                      });
                      return;
                    }
                  }
                  await action.handler(userId, sid, data.payload, socket);
                } catch (err) {
                  reportQueryError(scope, err);
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
            chalk`${d()} {red Websocket has been rate limited for user {yellow ${userId}} and SID {yellow ${sid}}}`
          );
          throttledManualReport('websocket is being throttled', undefined);
          socket.emit(RECEIVE_RATE_LIMITED);
        }
      });
    });

    socket.on('disconnect', async () => {
      if (socket.sessionId) {
        console.log(
          chalk`${d()}{blue Disconnection: }{red User left} {grey ${
            socket.id
          } ${ip}}`
        );
        const sessionEntity = await getSessionWithVisitors(socket.sessionId);
        if (sessionEntity) {
          sendClientList(sessionEntity, socket);
        }
      }
    });
  });
};
