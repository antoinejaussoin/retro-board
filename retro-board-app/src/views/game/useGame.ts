import { useEffect, useMemo, useState, useCallback } from 'react';
import { Actions, Post, PostType, User } from 'retro-board-common';
import { v4 } from 'uuid';
import uniq from 'lodash/uniq';
import { trackEvent } from './../../track';
import io from 'socket.io-client';
import useGlobalState from '../../state';
import usePreviousSessions from '../../hooks/usePreviousSessions';

const debug = process.env.REACT_APP_DEBUG === 'true';

function sendFactory(
  socket: SocketIOClient.Socket,
  user: User,
  sessionId: string
) {
  return function(action: string, payload?: any) {
    if (socket && user) {
      socket.emit(action, {
        sessionId: sessionId,
        payload: {
          user,
          ...payload,
        },
      });
    }
  };
}

const useGame = (sessionId: string) => {
  const [initialised, setInitialised] = useState(false);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const { addToPreviousSessions } = usePreviousSessions();
  const {
    state,
    receivePost,
    receiveBoard,
    setPlayers,
    deletePost,
    updatePost,
    renameSession,
    resetSession,
  } = useGlobalState();

  const {
    username: user,
    session: { name: sessionName },
  } = state;

  // Send function, built with current socket, user and sessionId
  const send = useMemo(
    () => (socket && user ? sendFactory(socket, user, sessionId) : null),
    [socket, user, sessionId]
  );

  // This effect will run everytime the gameId, the user, or the socket changes.
  // It will close and restart the socket every time.
  useEffect(() => {
    if (!user) {
      return;
    }
    if (debug) {
      console.log('Initialising Game socket');
    }
    const newSocket = io();
    resetSession();
    setSocket(newSocket);

    const send = sendFactory(newSocket, user, sessionId);

    // Socket events listeners
    newSocket.on('disconnect', () => {
      console.warn('Server disconnected');
    });

    newSocket.on('connect', () => {
      if (debug) {
        console.log('Connected to the socket');
      }
      setInitialised(true);
      send(Actions.LOGIN_SUCCESS);
      send(Actions.JOIN_SESSION);
      trackEvent(Actions.JOIN_SESSION);
    });

    newSocket.on(Actions.RECEIVE_POST, (post: Post) => {
      if (debug) {
        console.log('Receive new post: ', post);
      }
      receivePost(post);
    });

    newSocket.on(Actions.RECEIVE_BOARD, (posts: Post[]) => {
      if (debug) {
        console.log('Receive entire board: ', posts);
      }
      receiveBoard(posts);
    });

    newSocket.on(Actions.RECEIVE_CLIENT_LIST, (clients: string[]) => {
      if (debug) {
        console.log('Receive players list: ', clients);
      }
      setPlayers(clients);
    });

    newSocket.on(Actions.RECEIVE_DELETE_POST, (post: Post) => {
      if (debug) {
        console.log('Delete post: ', post);
      }
      deletePost(post);
    });

    newSocket.on(Actions.RECEIVE_LIKE, (post: Post) => {
      if (debug) {
        console.log('Receive like: ', post);
      }
      updatePost(post);
    });

    newSocket.on(Actions.RECEIVE_EDIT_POST, (post: { post: Post }) => {
      if (debug) {
        console.log('Receive edit post: ', post.post);
      }
      updatePost(post.post);
    });

    newSocket.on(Actions.RECEIVE_SESSION_NAME, (name: string) => {
      if (debug) {
        console.log('Receive session name: ', name);
      }
      renameSession(name);
    });
    return () => {
      if (debug) {
        console.log('Attempting disconnection');
      }
      if (newSocket) {
        resetSession();
        newSocket.disconnect();
      }
    };
  }, [
    user,
    sessionId,
    resetSession,
    receivePost,
    receiveBoard,
    setPlayers,
    deletePost,
    updatePost,
    renameSession,
  ]);

  // This drives the addition of the game to the list
  // of previous sessions on the homepage (stored in local storage).
  useEffect(() => {
    if (user) {
      if (debug) {
        console.log('Add to previous sessions');
      }
      addToPreviousSessions(sessionId, sessionName, user);
    }
  }, [user, sessionId, sessionName, addToPreviousSessions]);

  // Callbacks
  const onAddPost = useCallback(
    (type: PostType, content: string) => {
      if (send) {
        const post: Post = {
          content,
          dislikes: [],
          likes: [],
          id: v4(),
          postType: type,
          user: user!,
        };

        receivePost(post);
        send(Actions.ADD_POST_SUCCESS, post);
        trackEvent(Actions.ADD_POST_SUCCESS);
      }
    },
    [receivePost, send, user]
  );

  const onEditPost = useCallback(
    (post: Post) => {
      if (send) {
        updatePost(post);
        send(Actions.EDIT_POST, { post });
        trackEvent(Actions.EDIT_POST);
      }
    },
    [updatePost, send]
  );

  const onDeletePost = useCallback(
    (post: Post) => {
      if (send) {
        deletePost(post);
        send(Actions.DELETE_POST, post);
        trackEvent(Actions.DELETE_POST);
      }
    },
    [deletePost, send]
  );

  const onLike = useCallback(
    (post: Post, like: boolean) => {
      if (send) {
        const likes = like ? uniq(post.likes.concat([user!])) : post.likes;
        const dislikes = !like
          ? uniq(post.dislikes.concat([user!]))
          : post.dislikes;
        const modifiedPost: Post = {
          ...post,
          likes,
          dislikes,
        };
        updatePost(modifiedPost);
        send(Actions.LIKE_SUCCESS, {
          like,
          post,
        });
        trackEvent(Actions.LIKE_SUCCESS);
      }
    },
    [user, send, updatePost]
  );

  const onRenameSession = useCallback(
    (name: string) => {
      if (send) {
        renameSession(name);
        send(Actions.RENAME_SESSION, { name });
        trackEvent(Actions.RENAME_SESSION);
      }
    },
    [send, renameSession]
  );

  return {
    initialised,
    onAddPost,
    onEditPost,
    onDeletePost,
    onLike,
    onRenameSession,
  };
};

export default useGame;
