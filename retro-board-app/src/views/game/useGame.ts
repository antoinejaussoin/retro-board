import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Actions,
  Post,
  PostGroup,
  VoteType,
  SessionOptions,
  ColumnDefinition,
  Participant,
  UnauthorizedAccessPayload,
  WsLikeUpdatePayload,
  WsPostUpdatePayload,
  WsDeletePostPayload,
  WsDeleteGroupPayload,
  WsNameData,
  WsSaveTemplatePayload,
  VoteExtract,
  WsReceiveLikeUpdatePayload,
  WsErrorPayload,
  WebsocketMessage,
} from '@retrospected/common';
import { v4 } from 'uuid';
import find from 'lodash/find';
import { setScope, trackAction, trackEvent } from '../../track';
import io from 'socket.io-client';
import useGlobalState from '../../state';
import useUser from '../../auth/useUser';
import { getMiddle, getNext } from './lexorank';
import { useSnackbar } from 'notistack';
import {
  getAddedParticipants,
  getRemovedParticipants,
  joinNames,
} from './participants-notifiers';
import useTranslation from '../../translations/useTranslations';
import { omit } from 'lodash';
import { AckItem } from './types';

export type Status =
  /**
   * Not yet connected, will connect as soon as possible
   */
  | 'not-connected'
  /**
   * Connected to the websocket, but hasn't got the session data yet
   */
  | 'connecting'
  /**
   * Connected to the websocket, and got session data (all ready to display)
   */
  | 'connected'
  /**
   * Disconnected, not planning to re-connect automatically (switch to not-connected for that)
   */
  | 'disconnected';

const debug = process.env.NODE_ENV === 'development';

function sendFactory(
  socket: SocketIOClient.Socket,
  sessionId: string,
  setAcks?: React.Dispatch<React.SetStateAction<AckItem[]>>
) {
  return function <T>(action: string, payload?: T) {
    if (socket) {
      const messagePayload: WebsocketMessage<T | undefined> = {
        sessionId,
        ack: v4(),
        payload,
      };
      if (setAcks) {
        setAcks((acks) => [
          ...acks,
          { ack: messagePayload.ack, requested: new Date() },
        ]);
      }
      if (debug) {
        console.info('Sending message to socket', action, messagePayload);
      }
      socket.emit(action, messagePayload);
    }
  };
}

const useGame = (sessionId: string) => {
  const { enqueueSnackbar } = useSnackbar();
  const translations = useTranslation();
  const [status, setStatus] = useState<Status>('not-connected');
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [acks, setAcks] = useState<AckItem[]>([]);
  const {
    state,
    receivePost,
    receivePostGroup,
    receiveBoard,
    setPlayers,
    deletePost,
    updatePost,
    deletePostGroup,
    updatePostGroup,
    receiveVote,
    renameSession,
    resetSession,
    editOptions,
    editColumns,
    lockSession,
    unauthorized,
  } = useGlobalState();

  const { session } = state;
  const user = useUser();
  const userId = user?.id;
  const allowMultipleVotes = session
    ? session.options.allowMultipleVotes
    : false;

  // Send function, built with current socket, user and sessionId
  const send = useMemo(
    () => (socket ? sendFactory(socket, sessionId, setAcks) : null),
    [socket, sessionId]
  );

  const reconnect = useCallback(() => {
    setAcks([]);
    setStatus('not-connected');
  }, []);

  // Creating the socket
  useEffect(() => {
    let newSocket: SocketIOClient.Socket | null = null;
    if (status === 'not-connected') {
      newSocket = io();
      setSocket(newSocket);
    }
  }, [status]);

  // Cleaning up the socket
  useEffect(() => {
    return () => {
      if (debug) {
        console.log('Attempting disconnection');
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // This will run on unmount
  useEffect(() => {
    return () => {
      if (debug) {
        console.log('Reset session');
      }
      trackEvent('game/session/reset');
      resetSession();
    };
  }, [resetSession]);

  // This effect will run everytime the gameId, the user, or the socket changes.
  // It will close and restart the socket every time.
  useEffect(() => {
    if (status !== 'not-connected') {
      return;
    }
    if (!socket) {
      return;
    }

    if (debug) {
      console.log('Initialising Game socket');
    }

    socket.removeAllListeners();

    const send = sendFactory(socket, sessionId);

    // Socket events listeners
    socket.on('disconnect', () => {
      if (debug) {
        console.warn('Server disconnected');
      }
      trackEvent('game/session/disconnect');
      setStatus('disconnected');
    });

    socket.on('connect', () => {
      if (debug) {
        console.log('Connected to the socket');
      }
      setStatus('connecting');
      send<void>(Actions.JOIN_SESSION);
      trackAction(Actions.JOIN_SESSION);
      setScope((scope) => {
        if (scope) {
          scope.setExtra('game', sessionId);
        }
      });
    });

    socket.on(Actions.ACK, (ack: string) => {
      if (debug) {
        console.log('Received ACK: ', ack);
      }
      setAcks((acks) => acks.filter((a) => a.ack !== ack));
    });

    socket.on(Actions.RECEIVE_POST, (post: Post) => {
      if (debug) {
        console.log('Receive new post: ', post);
      }
      receivePost(post);
    });

    socket.on(Actions.RECEIVE_POST_GROUP, (group: PostGroup) => {
      if (debug) {
        console.log('Receive new post group: ', group);
      }
      receivePostGroup(group);
    });

    socket.on(Actions.RECEIVE_BOARD, (posts: Post[]) => {
      if (debug) {
        console.log('Receive entire board: ', posts);
      }
      setStatus('connected');
      receiveBoard(posts);
    });

    socket.on(Actions.RECEIVE_OPTIONS, (options: SessionOptions) => {
      if (debug) {
        console.log('Receive updated options: ', options);
      }
      editOptions(options);
    });

    socket.on(Actions.RECEIVE_COLUMNS, (columns: ColumnDefinition[]) => {
      if (debug) {
        console.log('Receive updated columns: ', columns);
      }
      editColumns(columns);
    });

    socket.on(Actions.RECEIVE_CLIENT_LIST, (participants: Participant[]) => {
      if (debug) {
        console.log('Receive participants list: ', participants);
      }
      setPlayers(participants);
    });

    socket.on(Actions.RECEIVE_DELETE_POST, (post: WsDeletePostPayload) => {
      if (debug) {
        console.log('Delete post: ', post);
      }
      deletePost(post.postId);
    });

    socket.on(
      Actions.RECEIVE_DELETE_POST_GROUP,
      (group: WsDeleteGroupPayload) => {
        if (debug) {
          console.log('Delete post group: ', group);
        }
        deletePostGroup(group.groupId);
      }
    );

    socket.on(
      Actions.RECEIVE_LIKE,
      ({ postId, vote }: WsReceiveLikeUpdatePayload) => {
        if (debug) {
          console.log('Receive vote: ', postId, vote);
        }
        receiveVote(postId, vote);
      }
    );

    socket.on(Actions.RECEIVE_EDIT_POST, (post: Post | null) => {
      if (debug) {
        console.log('Receive edit post: ', post);
      }
      if (post) {
        updatePost(post);
      }
    });

    socket.on(Actions.RECEIVE_EDIT_POST_GROUP, (group: PostGroup) => {
      if (debug) {
        console.log('Receive edit group: ', group);
      }
      updatePostGroup(group);
    });

    socket.on(Actions.RECEIVE_SESSION_NAME, (name: string) => {
      if (debug) {
        console.log('Receive session name: ', name);
      }
      renameSession(name);
    });

    socket.on(Actions.RECEIVE_LOCK_SESSION, (locked: boolean) => {
      if (debug) {
        console.log('Receive lock session: ', locked);
      }
      lockSession(locked);
    });

    socket.on(
      Actions.RECEIVE_UNAUTHORIZED,
      (payload: UnauthorizedAccessPayload) => {
        if (debug) {
          console.log('Receive unauthorized');
        }
        unauthorized(payload.type);
      }
    );

    socket.on(Actions.RECEIVE_ERROR, (payload: WsErrorPayload) => {
      if (debug) {
        console.log('Receive Error: ', payload);
      }
      enqueueSnackbar(translations.PostBoard.error!(payload.type), {
        variant: 'error',
      });
      if (payload.type !== 'cannot_get_session') {
        send<void>(Actions.REQUEST_BOARD);
      } else {
        setStatus('connected');
      }
    });

    socket.on(Actions.RECEIVE_RATE_LIMITED, () => {
      enqueueSnackbar(
        'You have been rate-limited, as you have sent too many messages in a short period of time.',
        { variant: 'error', title: 'Rate Limit Error' }
      );
    });
  }, [
    socket,
    status,
    userId,
    sessionId,
    resetSession,
    receivePost,
    receiveVote,
    receiveBoard,
    setPlayers,
    deletePost,
    updatePost,
    editOptions,
    editColumns,
    receivePostGroup,
    deletePostGroup,
    updatePostGroup,
    renameSession,
    lockSession,
    unauthorized,
    enqueueSnackbar,
    translations,
  ]);

  const [previousParticipans, setPreviousParticipants] = useState(
    state.players
  );

  useEffect(() => {
    if (userId && previousParticipans !== state.players) {
      const added = getAddedParticipants(
        userId,
        previousParticipans,
        state.players
      );
      if (added.length) {
        enqueueSnackbar(translations.Clients.joined!(joinNames(added)), {
          variant: 'success',
        });
      }
      const removed = getRemovedParticipants(
        userId,
        previousParticipans,
        state.players
      );
      if (removed.length) {
        enqueueSnackbar(translations.Clients.left!(joinNames(removed)), {
          variant: 'info',
        });
      }
      setPreviousParticipants(state.players);
    }
  }, [
    state.players,
    previousParticipans,
    enqueueSnackbar,
    userId,
    translations,
  ]);

  // Callbacks
  const onAddPost = useCallback(
    (columnIndex: number, content: string, rank: string) => {
      if (send) {
        const post: Post = {
          content,
          action: null,
          giphy: null,
          votes: [],
          id: v4(),
          column: columnIndex,
          user: user!,
          group: null,
          rank,
        };

        receivePost(post);
        send<Post>(Actions.ADD_POST_SUCCESS, post);
        trackAction(Actions.ADD_POST_SUCCESS);
      }
    },
    [receivePost, send, user]
  );

  const onAddGroup = useCallback(
    (columnIndex: number, rank: string) => {
      if (send) {
        const group: PostGroup = {
          id: v4(),
          label: 'My Group',
          column: columnIndex,
          user: user!,
          posts: [],
          rank,
        };

        receivePostGroup(group);
        send<PostGroup>(Actions.ADD_POST_GROUP_SUCCESS, group);
        trackAction(Actions.ADD_POST_GROUP_SUCCESS);
      }
    },
    [receivePostGroup, send, user]
  );

  const onEditPost = useCallback(
    (post: Post) => {
      if (send) {
        updatePost(post);
        send<WsPostUpdatePayload>(Actions.EDIT_POST, toPostUpdate(post));
        trackAction(Actions.EDIT_POST);
      }
    },
    [updatePost, send]
  );

  const onEditPostGroup = useCallback(
    (group: PostGroup) => {
      if (send) {
        updatePostGroup(group);
        send<PostGroup>(Actions.EDIT_POST_GROUP, group);
        trackAction(Actions.EDIT_POST_GROUP);
      }
    },
    [updatePostGroup, send]
  );

  const onMovePost = useCallback(
    (
      post: Post,
      destinationGroup: PostGroup | null,
      destinationColumn: number,
      newRank: string
    ) => {
      if (send) {
        const updatedPost: Post = {
          ...post,
          column: destinationColumn,
          group: destinationGroup,
          rank: newRank,
        };
        updatePost(updatedPost);
        send<WsPostUpdatePayload>(Actions.EDIT_POST, toPostUpdate(updatedPost));
        trackAction(Actions.MOVE_POST);
      }
    },
    [updatePost, send]
  );

  const onCombinePost = useCallback(
    (post1: Post, post2: Post) => {
      if (send) {
        const destinationColumn = post2.column;
        const group: PostGroup = {
          id: v4(),
          label: 'My Group',
          column: post2.column,
          user: user!,
          posts: [],
          rank: getMiddle(),
        };

        receivePostGroup(group);
        send<PostGroup>(Actions.ADD_POST_GROUP_SUCCESS, group);
        trackAction(Actions.ADD_POST_GROUP_SUCCESS);

        const updatedPost1: Post = {
          ...post1,
          column: destinationColumn,
          group: group,
          rank: getMiddle(),
        };
        updatePost(updatedPost1);
        send<WsPostUpdatePayload>(
          Actions.EDIT_POST,
          toPostUpdate(updatedPost1)
        );

        const updatedPost2: Post = {
          ...post2,
          column: destinationColumn,
          group: group,
          rank: getNext(getMiddle()),
        };
        updatePost(updatedPost2);
        send<WsPostUpdatePayload>(
          Actions.EDIT_POST,
          toPostUpdate(updatedPost2)
        );

        trackAction(Actions.MOVE_POST);
      }
    },
    [updatePost, user, receivePostGroup, send]
  );

  const onDeletePost = useCallback(
    (post: Post) => {
      if (send) {
        deletePost(post.id);
        send<WsDeletePostPayload>(Actions.DELETE_POST, {
          postId: post.id,
        });
        trackAction(Actions.DELETE_POST);
      }
    },
    [deletePost, send]
  );

  const onDeletePostGroup = useCallback(
    (group: PostGroup) => {
      if (send) {
        deletePostGroup(group.id);
        send<WsDeleteGroupPayload>(Actions.DELETE_POST_GROUP, {
          groupId: group.id,
        });
        trackAction(Actions.DELETE_POST_GROUP);
      }
    },
    [deletePostGroup, send]
  );

  const onLike = useCallback(
    (post: Post, like: boolean) => {
      if (send) {
        const type: VoteType = like ? 'like' : 'dislike';
        const existingVote = find(
          post.votes,
          (v) => v.type === type && v.userId === user!.id
        );
        if (existingVote && !allowMultipleVotes) {
          return;
        }

        const voteExtract: VoteExtract = {
          id: v4(),
          type,
          userName: user!.name,
          userId: user!.id,
        };
        const modifiedPost: Post = {
          ...post,
          votes: [...post.votes, voteExtract],
        };
        updatePost(modifiedPost);
        send<WsLikeUpdatePayload>(Actions.LIKE_SUCCESS, {
          type,
          postId: post.id,
        });
        trackAction(Actions.LIKE_SUCCESS);
      }
    },
    [user, send, updatePost, allowMultipleVotes]
  );

  const onRenameSession = useCallback(
    (name: string) => {
      if (send) {
        renameSession(name);
        send<WsNameData>(Actions.RENAME_SESSION, { name });
        trackAction(Actions.RENAME_SESSION);
      }
    },
    [send, renameSession]
  );

  const onEditOptions = useCallback(
    (options: SessionOptions) => {
      if (send) {
        editOptions(options);
        send<SessionOptions>(Actions.EDIT_OPTIONS, options);
        trackAction(Actions.EDIT_OPTIONS);
      }
    },
    [send, editOptions]
  );

  const onEditColumns = useCallback(
    (columns: ColumnDefinition[]) => {
      if (send) {
        editColumns(columns);
        send<ColumnDefinition[]>(Actions.EDIT_COLUMNS, columns);
        trackAction(Actions.EDIT_COLUMNS);
      }
    },
    [send, editColumns]
  );

  const onSaveTemplate = useCallback(
    (options: SessionOptions, columns: ColumnDefinition[]) => {
      if (send) {
        send<WsSaveTemplatePayload>(Actions.SAVE_TEMPLATE, {
          options,
          columns,
        });
        trackAction(Actions.SAVE_TEMPLATE);
      }
    },
    [send]
  );

  const onLockSession = useCallback(
    (locked: boolean) => {
      if (send) {
        lockSession(locked);
        send<boolean>(Actions.LOCK_SESSION, locked);
        trackAction(Actions.LOCK_SESSION);
      }
    },
    [send, lockSession]
  );

  return {
    status,
    acks,
    onAddPost,
    onAddGroup,
    onEditPost,
    onEditPostGroup,
    onMovePost,
    onCombinePost,
    onDeletePost,
    onDeletePostGroup,
    onLike,
    onRenameSession,
    onEditOptions,
    onEditColumns,
    onSaveTemplate,
    onLockSession,
    reconnect,
  };
};

function toPostUpdate(post: Post): WsPostUpdatePayload {
  return {
    post: omit(post, ['votes', 'user']),
  };
}

export default useGame;
