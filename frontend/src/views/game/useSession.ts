import type {
  Message,
  Post,
  PostGroup,
  Session,
  SessionSettings,
  VoteExtract,
} from 'common';
import { useCallback } from 'react';
import type { SessionEvent } from './reduceSession';
import { useGameStore } from './state';

interface UseSession {
  session: Session | null;
  resetSession: () => void;
  receivePost: (post: Post) => void;
  receivePostGroup: (postGroup: PostGroup) => void;
  receiveChatMessage: (message: Message) => void;
  receiveBoard: (session: Session) => void;
  updatePost: (post: Post) => void;
  updatePostGroup: (group: PostGroup) => void;
  receiveVote: (postId: string, vote: VoteExtract) => void;
  deletePost: (postId: string) => void;
  deletePostGroup: (groupId: string) => void;
  editSessionSettings: (updated: SessionSettings) => void;
  lockSession: (locked: boolean) => void;
  userReady: (userId: string, ready?: boolean) => void;
  cancelVotes: (postId: string, userId: string) => void;
}

export default function useSession(): UseSession {
  const session = useGameStore((s) => s.session);
  const dispatch = useGameStore((s) => s.dispatch);
  const send = useCallback(
    (event: SessionEvent) => {
      dispatch(event);
    },
    [dispatch],
  );

  const resetSession = useCallback(() => {
    send({ type: 'reset' });
  }, [send]);

  const receivePost = useCallback(
    (post: Post) => {
      send({ type: 'add-post', post });
    },
    [send],
  );

  const receivePostGroup = useCallback(
    (postGroup: PostGroup) => {
      send({ type: 'add-group', group: postGroup });
    },
    [send],
  );

  const receiveChatMessage = useCallback(
    (message: Message) => {
      send({ type: 'add-message', message });
    },
    [send],
  );

  const receiveBoard = useCallback(
    (next: Session) => {
      send({ type: 'receive-board', session: next });
    },
    [send],
  );

  const updatePost = useCallback(
    (post: Post) => {
      send({ type: 'update-post', post });
    },
    [send],
  );

  const updatePostGroup = useCallback(
    (group: PostGroup) => {
      send({ type: 'update-group', group });
    },
    [send],
  );

  const receiveVote = useCallback(
    (postId: string, vote: VoteExtract) => {
      send({ type: 'add-vote', postId, vote });
    },
    [send],
  );

  const cancelVotes = useCallback(
    (postId: string, userId: string) => {
      send({ type: 'cancel-votes', postId, userId });
    },
    [send],
  );

  const deletePost = useCallback(
    (postId: string) => {
      send({ type: 'delete-post', postId });
    },
    [send],
  );

  const deletePostGroup = useCallback(
    (groupId: string) => {
      send({ type: 'delete-group', groupId });
    },
    [send],
  );

  const editSessionSettings = useCallback(
    (settings: SessionSettings) => {
      send({ type: 'settings', settings });
    },
    [send],
  );

  const lockSession = useCallback(
    (locked: boolean) => {
      send({ type: 'lock', locked });
    },
    [send],
  );

  const userReady = useCallback(
    (userId: string, ready?: boolean) => {
      send({ type: 'ready', userId, ready });
    },
    [send],
  );

  return {
    session,
    resetSession,
    receiveBoard,
    receivePost,
    receivePostGroup,
    receiveChatMessage,
    receiveVote,
    updatePost,
    updatePostGroup,
    deletePost,
    deletePostGroup,
    editSessionSettings,
    lockSession,
    userReady,
    cancelVotes,
  };
}
