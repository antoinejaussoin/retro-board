import {
  ColumnDefinition,
  Post,
  PostGroup,
  Session,
  VoteExtract,
  SessionOptions,
  Message,
} from 'common';
import { findIndex } from 'lodash';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { SessionState } from './state';

interface UseSession {
  session: Session | null;
  renameSession: (name: string) => void;
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
  editOptions: (options: SessionOptions) => void;
  editColumns: (columns: ColumnDefinition[]) => void;
  lockSession: (locked: boolean) => void;
  userReady: (userId: string, ready?: boolean) => void;
}

export default function useSession(): UseSession {
  const [session, setSession] = useRecoilState(SessionState);

  const renameSession = useCallback(
    (name: string) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              name,
            }
      );
    },
    [setSession]
  );

  const resetSession = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const receivePost = useCallback(
    (post: Post) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              posts: [...session.posts, post],
            }
      );
    },
    [setSession]
  );

  const receivePostGroup = useCallback(
    (postGroup: PostGroup) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              groups: [...session.groups, postGroup],
            }
      );
    },
    [setSession]
  );

  const receiveChatMessage = useCallback(
    (message: Message) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              messages: [...session.messages, message],
            }
      );
    },
    [setSession]
  );

  const receiveBoard = useCallback(
    (session: Session) => {
      setSession(session);
    },
    [setSession]
  );

  const updatePost = useCallback(
    (post: Post) => {
      setSession((session) => {
        if (!session) {
          return session;
        }
        const index = findIndex(session.posts, (p) => p.id === post.id);
        if (index === -1) {
          return session;
        }
        return {
          ...session,
          posts: [
            ...session.posts.slice(0, index),
            post,
            ...session.posts.slice(index + 1),
          ],
        };
      });
    },
    [setSession]
  );

  const updatePostGroup = useCallback(
    (group: PostGroup) => {
      setSession((session) => {
        if (!session) {
          return session;
        }
        const index = findIndex(session.groups, (p) => p.id === group.id);
        if (index === -1) {
          return session;
        }
        return {
          ...session,
          groups: [
            ...session.groups.slice(0, index),
            group,
            ...session.groups.slice(index + 1),
          ],
        };
      });
    },
    [setSession]
  );

  const receiveVote = useCallback(
    (postId: string, vote: VoteExtract) => {
      setSession((session) => {
        if (!session) {
          return session;
        }
        const postIndex = findIndex(session.posts, (p) => p.id === postId);
        const post = session.posts[postIndex];
        if (!post) {
          return session;
        }
        return {
          ...session,
          posts: [
            ...session.posts.slice(0, postIndex),
            {
              ...post,
              votes: [...post.votes, vote],
            },
            ...session.posts.slice(postIndex + 1),
          ],
        };
      });
    },
    [setSession]
  );

  const deletePost = useCallback(
    (postId: string) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              posts: session.posts.filter((p) => p.id !== postId),
            }
      );
    },
    [setSession]
  );

  const deletePostGroup = useCallback(
    (groupId: string) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              groups: session.groups.filter((g) => g.id !== groupId),
              posts: session.posts.map((p) =>
                p.group && p.group.id === groupId
                  ? {
                      ...p,
                      group: null,
                    }
                  : p
              ),
            }
      );
    },
    [setSession]
  );
  const editOptions = useCallback(
    (options: SessionOptions) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              options,
            }
      );
    },
    [setSession]
  );
  const editColumns = useCallback(
    (columns: ColumnDefinition[]) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              columns,
            }
      );
    },
    [setSession]
  );

  const lockSession = useCallback(
    (locked: boolean) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              locked,
            }
      );
    },
    [setSession]
  );

  const userReady = useCallback(
    (userId: string, ready?: boolean) => {
      setSession((session) =>
        !session
          ? session
          : {
              ...session,
              ready: (
                ready === undefined ? !session.ready.includes(userId) : ready
              )
                ? [...session.ready, userId]
                : session.ready.filter((id) => id !== userId),
            }
      );
    },
    [setSession]
  );

  return {
    session,
    renameSession,
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
    editColumns,
    editOptions,
    lockSession,
    userReady,
  };
}
