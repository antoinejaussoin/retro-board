import { permissionLogic } from '../permissions-logic';
import {
  Post,
  Session,
  User,
  SessionOptions,
  Vote,
  VoteType,
  defaultOptions,
} from 'retro-board-common';
import { v4 } from 'uuid';

const userBase: User = {
  language: 'en',
  photo: null,
  accountType: 'anonymous',
  id: '0',
  name: 'name',
  username: 'username',
};

const currentUser: User = {
  ...userBase,
  id: '1',
  name: 'Current',
  username: 'current',
};

const anotherUser: User = {
  ...userBase,
  id: '2',
  name: 'Another User',
  username: 'another-user',
};

function buildVotes(type: VoteType, users: User[], post: Post): Vote[] {
  return users.map(
    user =>
      ({
        id: v4(),
        post,
        type,
        user,
      } as Vote)
  );
}

const post = (user: User, likes?: User[], dislikes?: User[]): Post => {
  const p: Post = {
    user,
    column: 0,
    content: 'Some content',
    id: 'acme',
    action: '',
    giphy: null,
    votes: [],
    group: null,
    rank: 'blah',
  };
  p.votes = [
    ...buildVotes('like', likes || [], p),
    ...buildVotes('dislike', dislikes || [], p),
  ];
  return p;
};

const session = (options: SessionOptions, ...posts: Post[]): Session => ({
  id: 'acme',
  name: 'Session title',
  posts,
  columns: [],
  createdBy: currentUser,
  options: {
    ...options,
  },
  groups: [],
});

describe('Permission Logic', () => {
  it('When using default rules, a user on its own post', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(true);
    expect(result.canDelete).toBe(true);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
  });

  it('When using default rules, a non-logged in user', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = permissionLogic(p, s, null);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
  });

  it('When using default rules, a user on another users post', () => {
    const p = post(anotherUser);
    const s = session(defaultOptions, p);
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When using default rules, a user on another users post but already voted', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(defaultOptions, p);
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
  });

  it('When limiting to 2 up votes, but already voted once', () => {
    const p1 = post(anotherUser, [currentUser]);
    const p2 = post(anotherUser, []);
    const s = session(
      {
        ...defaultOptions,
        maxUpVotes: 2,
      },
      p1,
      p2
    );
    const result = permissionLogic(p2, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When limiting to 2 up votes, but already voted twice', () => {
    const p1 = post(anotherUser, [currentUser]);
    const p2 = post(anotherUser, [currentUser]);
    const p3 = post(anotherUser, []);
    const s = session(
      {
        ...defaultOptions,
        maxUpVotes: 2,
      },
      p1,
      p2,
      p3
    );
    const result = permissionLogic(p3, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(false);
  });

  it('When preventing actions', () => {
    const p = post(anotherUser);
    const s = session(
      {
        ...defaultOptions,
        allowActions: false,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When preventing actions', () => {
    const p = post(anotherUser);
    const s = session(
      {
        ...defaultOptions,
        allowActions: false,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When allowing self-voting', () => {
    const p = post(currentUser);
    const s = session(
      {
        ...defaultOptions,
        allowSelfVoting: true,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(true);
    expect(result.canDelete).toBe(true);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When allowing multi-votes (unlimited votes)', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowMultipleVotes: true,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When allowing multi-votes (limited votes but not reached limit)', () => {
    const p = post(anotherUser, [currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowMultipleVotes: true,
        maxUpVotes: 3,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
  });

  it('When allowing multi-votes (limited votes but reached limit)', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowMultipleVotes: true,
        maxUpVotes: 3,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(false);
  });

  it('When allowing Giphy', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowGiphy: true,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canUseGiphy).toBe(true);
  });

  it('When disallowing Giphy', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowGiphy: false,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canUseGiphy).toBe(false);
  });

  it('When allowing reordering', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowReordering: true,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canReorder).toBe(true);
  });

  it('When disallowing reordering', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowReordering: false,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canReorder).toBe(false);
  });

  it('When allowing grouping', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowGrouping: true,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateGroup).toBe(true);
  });

  it('When disallowing grouping', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowGrouping: false,
      },
      p
    );
    const result = permissionLogic(p, s, currentUser);
    expect(result.canCreateGroup).toBe(false);
  });
});
