import {
  Actions,
  Session,
  Post,
  PostGroup,
  User,
  Participant,
  Vote,
  VoteType,
  ColumnDefinition,
  UnauthorizedAccessPayload,
} from '@retrospected/common';
import chalk from 'chalk';
import moment from 'moment';
import socketIo from 'socket.io';
import { find } from 'lodash';
import { v4 } from 'uuid';
import { setScope, reportQueryError } from './sentry';
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
} from './db/actions/sessions';
import { getUser, getUserView } from './db/actions/users';
import {
  savePost,
  savePostGroup,
  saveVote,
  deletePost,
  deletePostGroup,
} from './db/actions/posts';
import { Connection } from 'typeorm';

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
} = Actions;

interface ExtendedSocket extends socketIo.Socket {
  sessionId: string;
  userId: string | null;
}

interface Users {
  [socketId: string]: UserView | null;
}

interface UserData {
  user: User;
}

interface NameData extends UserData {
  name: string;
}

interface PostUpdate extends UserData {
  post: Post;
}

interface LikeUpdate extends PostUpdate {
  type: VoteType;
}

const s = (str: string) => chalk`{blue ${str.replace('retrospected/', '')}}`;

export default (connection: Connection, io: SocketIO.Server) => {
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
    post: Post
  ) => {
    if (!userId) {
      return;
    }
    await savePost(connection, userId, sessionId, post);
  };

  const persistPostGroup = async (
    userId: string | null,
    sessionId: string,
    group: PostGroup
  ) => {
    if (!userId) {
      return;
    }
    await savePostGroup(connection, userId, sessionId, group);
  };

  const persistVote = async (
    userId: string | null,
    sessionId: string,
    postId: string,
    vote: Vote
  ) => {
    if (!userId) {
      return;
    }
    await saveVote(connection, userId, sessionId, postId, vote);
  };

  const removePost = async (
    userId: string | null,
    sessionId: string,
    postId: string
  ) => {
    if (!userId) {
      return;
    }
    await deletePost(connection, userId, sessionId, postId);
  };

  const removePostGroup = async (
    userId: string | null,
    sessionId: string,
    groupId: string
  ) => {
    if (!userId) {
      return;
    }
    await deletePostGroup(connection, userId, sessionId, groupId);
  };

  const sendClientList = (session: SessionEntity, socket: ExtendedSocket) => {
    const room = io.nsps['/'].adapter.rooms[getRoom(session.id)];
    if (room) {
      const clients = Object.keys(room.sockets);
      const onlineParticipants: Participant[] = clients
        .map((id, i) =>
          users[id]
            ? users[id]!.toJson()
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
    session: Session,
    post: Post,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    await persistPost(userId, session.id, post);
    sendToAll(socket, session.id, RECEIVE_POST, post);
  };

  const onAddPostGroup = async (
    userId: string | null,
    session: Session,
    group: PostGroup,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    await persistPostGroup(userId, session.id, group);
    sendToAll(socket, session.id, RECEIVE_POST_GROUP, group);
  };

  const log = (msg: string) => {
    console.log(d() + msg);
  };

  const onJoinSession = async (
    userId: string | null,
    session: Session,
    _: UserData,
    socket: ExtendedSocket
  ) => {
    socket.join(getRoom(session.id), async () => {
      socket.sessionId = session.id;
      const user = userId ? await getUserView(connection, userId) : null;
      const sessionEntity = await getSessionWithVisitors(
        connection,
        session.id
      );

      if (sessionEntity) {
        const userAllowed = isAllowed(sessionEntity, user);
        if (userAllowed.allowed) {
          if (user) {
            recordUser(sessionEntity, user, socket);
            const userEntity = await getUser(connection, user.id);
            if (userEntity) {
              await storeVisitor(connection, session.id, userEntity);
            }
          }
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
    });
  };

  const onRenameSession = async (
    userId: string | null,
    session: Session,
    data: NameData,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    session.name = data.name;
    await updateName(connection, session.id, data.name);
    sendToAll(socket, session.id, RECEIVE_SESSION_NAME, data.name);
  };

  const onLeaveSession = async (
    _userId: string | null,
    session: Session,
    _data: void,
    socket: ExtendedSocket
  ) => {
    socket.leave(getRoom(session.id), async () => {
      const sessionEntity = await getSessionWithVisitors(
        connection,
        session.id
      );
      if (sessionEntity) {
        sendClientList(sessionEntity, socket);
      }
    });
  };

  const onDeletePost = async (
    userId: string | null,
    session: Session,
    data: Post,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    session.posts = session.posts.filter((p) => p.id !== data.id);
    await removePost(userId, session.id, data.id);
    sendToAll(socket, session.id, RECEIVE_DELETE_POST, data);
  };

  const onDeletePostGroup = async (
    userId: string | null,
    session: Session,
    data: PostGroup,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    session.groups = session.groups.filter((g) => g.id !== data.id);
    await removePostGroup(userId, session.id, data.id);
    sendToAll(socket, session.id, RECEIVE_DELETE_POST_GROUP, data);
  };

  const onLikePost = async (
    userId: string | null,
    session: Session,
    data: LikeUpdate,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const user = await getUser(connection, userId);
    const post = find(session.posts, (p) => p.id === data.post.id);
    if (post && user) {
      const existingVote: Vote | undefined = find(
        post.votes,
        (v) => v.user.id === user.id && v.type === data.type
      );

      if (session.options.allowMultipleVotes || !existingVote) {
        const vote: Vote = {
          id: v4(),
          user: user.toJson(),
          type: data.type,
        };
        await persistVote(userId, session.id, post.id, vote);
        sendToAll(socket, session.id, RECEIVE_LIKE, { postId: post.id, vote });
      }
    }
  };

  const onEditPost = async (
    userId: string | null,
    session: Session,
    data: PostUpdate,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const post = find(session.posts, (p) => p.id === data.post.id);
    if (post) {
      post.content = data.post.content;
      post.action = data.post.action;
      post.giphy = data.post.giphy;
      post.column = data.post.column;
      post.group = data.post.group;
      post.rank = data.post.rank;
      await persistPost(userId, session.id, post);
      sendToAll(socket, session.id, RECEIVE_EDIT_POST, data);
    }
  };

  const onEditPostGroup = async (
    userId: string | null,
    session: Session,
    data: PostGroup,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }
    const group = find(session.groups, (g) => g.id === data.id);
    if (group) {
      group.column = data.column;
      group.label = data.label;
      group.rank = data.rank;
      await persistPostGroup(userId, session.id, group);
      sendToAll(socket, session.id, RECEIVE_EDIT_POST_GROUP, data);
    }
  };

  const onEditOptions = async (
    userId: string | null,
    session: Session,
    data: SessionOptionsEntity,
    socket: ExtendedSocket
  ) => {
    if (!userId || !session) {
      return;
    }
    // Prevent non author from modifying options
    if (userId !== session.createdBy.id) {
      return;
    }

    await updateOptions(connection, session, data);

    sendToAll(socket, session.id, RECEIVE_OPTIONS, data);
  };

  const onEditColumns = async (
    userId: string | null,
    session: Session,
    data: ColumnDefinition[],
    socket: ExtendedSocket
  ) => {
    if (!userId || !session) {
      return;
    }
    // Prevent non author from modifying columns
    if (userId !== session.createdBy.id) {
      return;
    }

    await updateColumns(connection, session, data);

    sendToAll(socket, session.id, RECEIVE_COLUMNS, data);
  };

  const onSaveTemplate = async (
    userId: string | null,
    session: Session,
    data: { columns: ColumnDefinition[]; options: SessionOptionsEntity },
    _: ExtendedSocket
  ) => {
    if (!userId || !session) {
      return;
    }
    // Prevent non author from saving as template
    if (userId !== session.createdBy.id) {
      return;
    }

    await saveTemplate(connection, userId, session, data.columns, data.options);
  };

  const onLockSession = async (
    userId: string | null,
    session: Session,
    locked: boolean,
    socket: ExtendedSocket
  ) => {
    if (!userId) {
      return;
    }

    // Prevent non author from locking/unlocking sessions
    if (userId !== session.createdBy.id) {
      return;
    }

    await toggleSessionLock(connection, session.id, locked);

    sendToAll(socket, session.id, RECEIVE_LOCK_SESSION, locked);
  };

  io.on('connection', async (socket: ExtendedSocket) => {
    const ip =
      socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    // Todo: this is a bit hacky
    const userId: string = socket.request.session?.passport?.user;
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
        session: Session,
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
        setScope(async (scope) => {
          console.log(
            chalk`${d()}{red  <-- } ${s(action.type)} {grey ${JSON.stringify(
              data
            )}}`
          );
          const sid =
            action.type === LEAVE_SESSION ? socket.sessionId : data.sessionId;
          if (sid) {
            const session = await getSession(connection, sid); // Todo check if that's not a performance issue
            if (session) {
              try {
                await action.handler(userId, session, data.payload, socket);
              } catch (err) {
                reportQueryError(scope, err);
                throw err;
              }
            }
          }
        });
      });
    });

    socket.on('disconnect', async () => {
      if (socket.sessionId) {
        console.log(
          chalk`${d()}{blue Disconnection: }{red User left} {grey ${
            socket.id
          } ${ip}}`
        );
        const sessionEntity = await getSessionWithVisitors(
          connection,
          socket.sessionId
        );
        if (sessionEntity) {
          sendClientList(sessionEntity, socket);
        }
      }
    });
  });
};
