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
  Session,
  SessionOptions,
} from '@retrospected/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import chalk from 'chalk';
import moment from 'moment';
import { Server, Socket } from 'socket.io';
import { setScope, reportQueryError, throttledManualReport } from './sentry';
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

  const onAddPost = async (
    userId: string,
    sessionId: string,
    post: Post,
    socket: ExtendedSocket
  ) => {
    const createdPost = await savePost(userId, sessionId, post);
    if (createdPost) {
      sendToAll<Post>(socket, sessionId, RECEIVE_POST, createdPost);
    } else {
      // todo !!
    }
  };

  const onAddPostGroup = async (
    userId: string,
    sessionId: string,
    group: PostGroup,
    socket: ExtendedSocket
  ) => {
    const createdGroup = await savePostGroup(userId, sessionId, group);
    if (createdGroup) {
      sendToAll<PostGroup>(socket, sessionId, RECEIVE_POST_GROUP, createdGroup);
    } else {
      // todo
    }
  };

  const log = (msg: string) => {
    console.log(d() + msg);
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
          // todo
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
    await updateName(sessionId, data.name);
    sendToAll<string>(socket, sessionId, RECEIVE_SESSION_NAME, data.name);
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
    await deletePost(userId, sessionId, data.postId);
    sendToAll<WsDeletePostPayload>(
      socket,
      sessionId,
      RECEIVE_DELETE_POST,
      data
    );
  };

  const onDeletePostGroup = async (
    userId: string,
    sessionId: string,
    data: WsDeleteGroupPayload,
    socket: ExtendedSocket
  ) => {
    await deletePostGroup(userId, sessionId, data.groupId);
    sendToAll<WsDeleteGroupPayload>(
      socket,
      sessionId,
      RECEIVE_DELETE_POST_GROUP,
      data
    );
  };

  const onLikePost = async (
    userId: string,
    sessionId: string,
    data: WsLikeUpdatePayload,
    socket: ExtendedSocket
  ) => {
    const vote = await registerVote(userId, sessionId, data.postId, data.type);
    if (vote) {
      sendToAll<WsReceiveLikeUpdatePayload>(socket, sessionId, RECEIVE_LIKE, {
        postId: data.postId,
        vote,
      });
    } else {
      // todo
    }
  };

  const onEditPost = async (
    _userId: string,
    sessionId: string,
    data: WsPostUpdatePayload,
    socket: ExtendedSocket
  ) => {
    const persistedPost = await updatePost(sessionId, data.post);
    if (persistedPost) {
      sendToAll<Post>(socket, sessionId, RECEIVE_EDIT_POST, persistedPost);
    }
  };

  const onEditPostGroup = async (
    userId: string,
    sessionId: string,
    data: PostGroup,
    socket: ExtendedSocket
  ) => {
    const group = await updatePostGroup(userId, sessionId, data);
    if (group) {
      sendToAll<PostGroup>(socket, sessionId, RECEIVE_EDIT_POST_GROUP, group);
    } else {
      // todo
    }
  };

  const onEditOptions = async (
    _userId: string,
    sessionId: string,
    data: SessionOptions,
    socket: ExtendedSocket
  ) => {
    await updateOptions(sessionId, data);
    sendToAll<SessionOptions>(socket, sessionId, RECEIVE_OPTIONS, data);
  };

  const onEditColumns = async (
    _userId: string,
    sessionId: string,
    data: ColumnDefinition[],
    socket: ExtendedSocket
  ) => {
    await updateColumns(sessionId, data);
    sendToAll<ColumnDefinition[]>(socket, sessionId, RECEIVE_COLUMNS, data);
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
      { type: RENAME_SESSION, handler: onRenameSession, onlyAuthor: true },
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
            if (sid) {
              const exists = await doesSessionExists(sid); // might be removed
              if (exists) {
                try {
                  if (action.onlyAuthor) {
                    if (!(await wasSessionCreatedBy(sid, userId))) {
                      return; // TODO: return error
                    }
                  }
                  await action.handler(userId, sid, data.payload, socket);
                } catch (err) {
                  reportQueryError(scope, err);
                  // TODO: send error to UI
                }
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
