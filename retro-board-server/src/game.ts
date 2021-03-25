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
} from '@retrospected/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import chalk from 'chalk';
import moment from 'moment';
import { Server, Socket } from 'socket.io';
import { find } from 'lodash';
import { setScope, reportQueryError, throttledManualReport } from './sentry';
import SessionOptionsEntity from './db/entities/SessionOptions';
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
} from './db/actions/sessions';
import { getUser, getUserView } from './db/actions/users';
import {
  savePost,
  savePostGroup,
  deletePost,
  deletePostGroup,
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
  userId: string | null;
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

  const persistPost = async (
    userId: string | null,
    sessionId: string,
    post: Post,
    update: boolean
  ): Promise<Post | null> => {
    if (!userId) {
      return null;
    }
    return await savePost(userId, sessionId, post, update);
  };

  const persistPostGroup = async (
    userId: string | null,
    sessionId: string,
    group: PostGroup
  ): Promise<PostGroup | null> => {
    if (!userId) {
      return null;
    }
    return await savePostGroup(userId, sessionId, group);
  };

  const removePost = async (
    userId: string | null,
    sessionId: string,
    postId: string
  ) => {
    if (!userId) {
      return;
    }
    await deletePost(userId, sessionId, postId);
  };

  const removePostGroup = async (
    userId: string | null,
    sessionId: string,
    groupId: string
  ) => {
    if (!userId) {
      return;
    }
    await deletePostGroup(userId, sessionId, groupId);
  };

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

      sendToSelf(socket, RECEIVE_CLIENT_LIST, [
        ...onlineParticipants,
        ...offlineParticipants,
      ]);
      sendToAll(socket, session.id, RECEIVE_CLIENT_LIST, [
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
    userId: string | null,
    sessionId: string,
    post: Post,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const createdPost = await persistPost(userId, sessionId, post, false);
    sendToAll(socket, sessionId, RECEIVE_POST, createdPost);
  };

  const onAddPostGroup = async (
    userId: string | null,
    sessionId: string,
    group: PostGroup,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const createdGroup = await persistPostGroup(userId, sessionId, group);
    sendToAll(socket, sessionId, RECEIVE_POST_GROUP, createdGroup);
  };

  const log = (msg: string) => {
    console.log(d() + msg);
  };

  const onJoinSession = async (
    userId: string | null,
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
        sendToSelf(socket, RECEIVE_BOARD, session);
      } else {
        log(chalk`{red User not allowed, session locked}`);
        const payload: UnauthorizedAccessPayload = {
          type: userAllowed.reason,
        };
        sendToSelf(socket, RECEIVE_UNAUTHORIZED, payload);
        socket.disconnect();
      }
    }
  };

  const onRenameSession = async (
    userId: string | null,
    sessionId: string,
    data: WsNameData,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    await updateName(sessionId, data.name);
    sendToAll(socket, sessionId, RECEIVE_SESSION_NAME, data.name);
  };

  const onLeaveSession = async (
    _userId: string | null,
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
    userId: string | null,
    sessionId: string,
    data: WsDeletePostPayload,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    await removePost(userId, sessionId, data.postId);
    sendToAll(socket, sessionId, RECEIVE_DELETE_POST, data);
  };

  const onDeletePostGroup = async (
    userId: string | null,
    sessionId: string,
    data: WsDeleteGroupPayload,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    await removePostGroup(userId, sessionId, data.groupId);
    sendToAll(socket, sessionId, RECEIVE_DELETE_POST_GROUP, data);
  };

  const onLikePost = async (
    userId: string | null,
    sessionId: string,
    data: WsLikeUpdatePayload,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const success = await registerVote(
      userId,
      sessionId,
      data.postId,
      data.type
    );
    if (success) {
      sendToAll(socket, sessionId, RECEIVE_LIKE, {
        postId: data.postId,
        vote: data.type,
      });
    }
  };

  const onEditPost = async (
    userId: string | null,
    sessionId: string,
    data: WsPostUpdatePayload,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      const post = find(session.posts, (p) => p.id === data.post.id);
      if (post) {
        post.content = data.post.content;
        post.action = data.post.action;
        post.giphy = data.post.giphy;
        post.column = data.post.column;
        post.group = data.post.group;
        post.rank = data.post.rank;
        const persistedPost = await persistPost(userId, sessionId, post, true);
        if (persistedPost) {
          sendToAll(socket, sessionId, RECEIVE_EDIT_POST, persistedPost);
        }
      }
    }
  };

  const onEditPostGroup = async (
    userId: string | null,
    sessionId: string,
    data: PostGroup,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      const group = find(session.groups, (g) => g.id === data.id);
      if (group) {
        group.column = data.column;
        group.label = data.label;
        group.rank = data.rank;
        const persistedGroup = await persistPostGroup(userId, sessionId, group);
        if (persistedGroup) {
          sendToAll(socket, sessionId, RECEIVE_EDIT_POST_GROUP, persistedGroup);
        }
      }
    }
  };

  const onEditOptions = async (
    userId: string | null,
    sessionId: string,
    data: SessionOptionsEntity,
    socket: ExtendedSocket
  ) => {
    if (!userId || !sessionId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      // Prevent non author from modifying options
      if (userId !== session.createdBy.id) {
        return;
      }

      await updateOptions(session, data);
      sendToAll(socket, sessionId, RECEIVE_OPTIONS, data);
    }
  };

  const onEditColumns = async (
    userId: string | null,
    sessionId: string,
    data: ColumnDefinition[],
    socket: ExtendedSocket
  ) => {
    if (!userId || !sessionId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      // Prevent non author from modifying columns
      if (userId !== session.createdBy.id) {
        return;
      }
      await updateColumns(session, data);
      sendToAll(socket, sessionId, RECEIVE_COLUMNS, data);
    }
  };

  const onSaveTemplate = async (
    userId: string | null,
    sessionId: string,
    data: WsSaveTemplatePayload,
    _: ExtendedSocket
  ) => {
    if (!userId || !sessionId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      // Prevent non author from saving as template
      if (userId !== session.createdBy.id) {
        return;
      }

      await saveTemplate(userId, session, data.columns, data.options);
    }
  };

  const onLockSession = async (
    userId: string | null,
    sessionId: string,
    locked: boolean,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const session = await getSession(sessionId);
    if (session) {
      // Prevent non author from locking/unlocking sessions
      if (userId !== session.createdBy.id) {
        return;
      }

      await toggleSessionLock(sessionId, locked);

      sendToAll(socket, sessionId, RECEIVE_LOCK_SESSION, locked);
    }
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

    interface Action {
      type: string;
      handler: (
        userId: string | null,
        sessionId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any,
        socket: ExtendedSocket
      ) => Promise<void>;
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
      { type: RENAME_SESSION, handler: onRenameSession },
      { type: LEAVE_SESSION, handler: onLeaveSession },
      { type: EDIT_OPTIONS, handler: onEditOptions },
      { type: EDIT_COLUMNS, handler: onEditColumns },
      { type: SAVE_TEMPLATE, handler: onSaveTemplate },
      { type: LOCK_SESSION, handler: onLockSession },
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
              // const session = await getSession(sid); // Todo check if that's not a performance issue
              const exists = await doesSessionExists(sid);
              if (exists) {
                try {
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
