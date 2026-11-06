import {
  defaultOptions,
  type Post,
  type PostGroup,
  type Session,
  type User,
} from 'common';
import { describe, expect, it } from 'vitest';
import { reduceSession, type SessionEvent } from '../reduceSession';

const user: User = { id: '1', name: 'danièle', photo: null, email: null };

function card(id: string): Post {
  return {
    id,
    content: 'foo',
    votes: [],
    action: '',
    column: 0,
    giphy: null,
    group: null,
    rank: '0',
    user,
  };
}

function group(id: string): PostGroup {
  return {
    id,
    column: 0,
    label: 'Group',
    posts: [],
    rank: '0',
    user,
  };
}

function board(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session',
    name: 'My Retro',
    posts: [],
    groups: [],
    columns: [],
    messages: [],
    encrypted: null,
    locked: false,
    createdBy: user,
    moderator: user,
    options: { ...defaultOptions },
    ready: [],
    timer: null,
    demo: false,
    ...overrides,
  };
}

function apply(session: Session | null, event: SessionEvent) {
  return reduceSession(session, event);
}

describe('reduceSession', () => {
  it('replaces the board and resets it', () => {
    const next = apply(null, { type: 'receive-board', session: board() });
    expect(next?.name).toBe('My Retro');
    expect(apply(next, { type: 'reset' })).toBeNull();
  });

  it('appends a post and replaces the matching one', () => {
    const start = board({ posts: [card('1'), card('2'), card('3')] });
    const added = apply(start, { type: 'add-post', post: card('4') });
    expect(added?.posts.map((post) => post.id)).toEqual(['1', '2', '3', '4']);

    const updated = apply(added, {
      type: 'update-post',
      post: { ...card('2'), content: 'bar' },
    });
    expect(updated?.posts.map((post) => post.content)).toEqual([
      'foo',
      'bar',
      'foo',
      'foo',
    ]);
    expect(apply(updated, { type: 'update-post', post: card('missing') })).toBe(
      updated,
    );
  });

  it('deletes a post and leaves the others', () => {
    const start = board({ posts: [card('1'), card('2'), card('3')] });
    const next = apply(start, { type: 'delete-post', postId: '2' });
    expect(next?.posts.map((post) => post.id)).toEqual(['1', '3']);
  });

  it('appends a chat message', () => {
    const start = board();
    const next = apply(start, {
      type: 'add-message',
      message: { id: 'm', content: 'hello', user, created: '2026-01-01' },
    });
    expect(next?.messages).toEqual([
      { id: 'm', content: 'hello', user, created: '2026-01-01' },
    ]);
  });

  it('adds a vote and cancels only that participant', () => {
    const start = board({ posts: [card('1')] });
    const voted = apply(start, {
      type: 'add-vote',
      postId: '1',
      vote: { id: 'v1', type: 'like', userId: '1', userName: 'danièle' },
    });
    const both = apply(voted, {
      type: 'add-vote',
      postId: '1',
      vote: { id: 'v2', type: 'like', userId: '2', userName: 'sam' },
    });
    const cancelled = apply(both, {
      type: 'cancel-votes',
      postId: '1',
      userId: '1',
    });
    expect(cancelled?.posts[0].votes.map((vote) => vote.userId)).toEqual(['2']);
    expect(
      apply(start, {
        type: 'add-vote',
        postId: 'missing',
        vote: { id: 'v', type: 'like', userId: '1', userName: 'danièle' },
      }),
    ).toBe(start);
  });

  it('deletes a group and detaches its posts', () => {
    const grouped = group('g');
    const start = board({
      groups: [grouped],
      posts: [{ ...card('1'), group: grouped }, card('2')],
    });
    const next = apply(start, { type: 'delete-group', groupId: 'g' });
    expect(next?.groups).toEqual([]);
    expect(next?.posts[0].group).toBeNull();
    expect(next?.posts[1].group).toBeNull();
  });

  it('keeps omitted settings and overwrites null name', () => {
    const start = board({ name: 'My Retro', locked: false });
    const renamed = apply(start, {
      type: 'settings',
      settings: { name: 'Something else' },
    });
    expect(renamed?.name).toBe('Something else');
    expect(renamed?.options).toBe(start.options);
    expect(renamed?.locked).toBe(false);

    const cleared = apply(renamed, {
      type: 'settings',
      settings: { name: null },
    });
    expect(cleared?.name).toBeNull();
    expect(cleared?.options).toBe(start.options);
  });

  it('locks the session', () => {
    const next = apply(board(), { type: 'lock', locked: true });
    expect(next?.locked).toBe(true);
  });

  it('toggles ready and honours an explicit value', () => {
    const on = apply(board(), { type: 'ready', userId: '1' });
    expect(on?.ready).toEqual(['1']);
    const off = apply(on, { type: 'ready', userId: '1' });
    expect(off?.ready).toEqual([]);
    const explicit = apply(off, { type: 'ready', userId: '2', ready: true });
    expect(explicit?.ready).toEqual(['2']);
  });

  it('ignores board edits when there is no session', () => {
    expect(apply(null, { type: 'add-post', post: card('1') })).toBeNull();
    expect(
      apply(null, { type: 'settings', settings: { name: 'x' } }),
    ).toBeNull();
    expect(apply(null, { type: 'delete-group', groupId: 'g' })).toBeNull();
  });
});
