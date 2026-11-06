import type {
  Message,
  Post,
  PostGroup,
  Session,
  SessionSettings,
  VoteExtract,
} from 'common';

export type SessionEvent =
  | { type: 'reset' }
  | { type: 'receive-board'; session: Session }
  | { type: 'add-post'; post: Post }
  | { type: 'add-group'; group: PostGroup }
  | { type: 'add-message'; message: Message }
  | { type: 'update-post'; post: Post }
  | { type: 'update-group'; group: PostGroup }
  | { type: 'add-vote'; postId: string; vote: VoteExtract }
  | { type: 'cancel-votes'; postId: string; userId: string }
  | { type: 'delete-post'; postId: string }
  | { type: 'delete-group'; groupId: string }
  | { type: 'settings'; settings: SessionSettings }
  | { type: 'lock'; locked: boolean }
  | { type: 'ready'; userId: string; ready?: boolean };

export function reduceSession(
  session: Session | null,
  event: SessionEvent,
): Session | null {
  switch (event.type) {
    case 'reset':
      return null;
    case 'receive-board':
      return event.session;
    case 'add-post':
      return session
        ? { ...session, posts: [...session.posts, event.post] }
        : null;
    case 'add-group':
      return session
        ? { ...session, groups: [...session.groups, event.group] }
        : null;
    case 'add-message':
      return session
        ? { ...session, messages: [...session.messages, event.message] }
        : null;
    case 'update-post':
      return replaceById(session, 'posts', event.post);
    case 'update-group':
      return replaceById(session, 'groups', event.group);
    case 'add-vote':
      return mapPost(session, event.postId, (post) => ({
        ...post,
        votes: [...post.votes, event.vote],
      }));
    case 'cancel-votes':
      return mapPost(session, event.postId, (post) => ({
        ...post,
        votes: post.votes.filter((vote) => vote.userId !== event.userId),
      }));
    case 'delete-post':
      return session
        ? {
            ...session,
            posts: session.posts.filter((post) => post.id !== event.postId),
          }
        : null;
    case 'delete-group':
      return session
        ? {
            ...session,
            groups: session.groups.filter(
              (group) => group.id !== event.groupId,
            ),
            posts: session.posts.map((post) =>
              post.group && post.group.id === event.groupId
                ? { ...post, group: null }
                : post,
            ),
          }
        : null;
    case 'settings':
      return session ? mergeSettings(session, event.settings) : null;
    case 'lock':
      return session ? { ...session, locked: event.locked } : null;
    case 'ready':
      return session
        ? { ...session, ready: nextReady(session, event.userId, event.ready) }
        : null;
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
}

function replaceById<Key extends 'posts' | 'groups'>(
  session: Session | null,
  key: Key,
  next: Session[Key][number],
): Session | null {
  if (!session) {
    return null;
  }
  const items = session[key];
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return session;
  }
  return {
    ...session,
    [key]: [...items.slice(0, index), next, ...items.slice(index + 1)],
  };
}

function mapPost(
  session: Session | null,
  postId: string,
  update: (post: Post) => Post,
): Session | null {
  if (!session) {
    return null;
  }
  const index = session.posts.findIndex((post) => post.id === postId);
  const post = session.posts[index];
  if (!post) {
    return session;
  }
  return {
    ...session,
    posts: [
      ...session.posts.slice(0, index),
      update(post),
      ...session.posts.slice(index + 1),
    ],
  };
}

function mergeSettings(session: Session, updated: SessionSettings): Session {
  return {
    ...session,
    name: updated.name === undefined ? session.name : updated.name,
    options: updated.options === undefined ? session.options : updated.options,
    columns: updated.columns === undefined ? session.columns : updated.columns,
    locked: updated.locked === undefined ? session.locked : updated.locked,
    moderator:
      updated.moderator === undefined ? session.moderator : updated.moderator,
  };
}

function nextReady(
  session: Session,
  userId: string,
  ready: boolean | undefined,
): string[] {
  const isReady = ready === undefined ? !session.ready.includes(userId) : ready;
  return isReady
    ? [...session.ready, userId]
    : session.ready.filter((id) => id !== userId);
}
