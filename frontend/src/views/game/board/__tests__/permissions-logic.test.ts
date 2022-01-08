import {
  postPermissionLogic,
  sessionPermissionLogic,
} from '../permissions-logic';
import {
  Post,
  Session,
  User,
  SessionOptions,
  VoteType,
  defaultOptions,
  VoteExtract,
} from 'common';
import { v4 } from 'uuid';

const userBase: User = {
  photo: null,
  id: '0',
  name: 'name',
};

const currentUser: User = {
  ...userBase,
  id: '1',
  name: 'Current',
};

const anotherUser: User = {
  ...userBase,
  id: '2',
  name: 'Another User',
};

function buildVotes(type: VoteType, users: User[], post: Post): VoteExtract[] {
  return users.map(
    (user) =>
      ({
        id: v4(),
        post,
        type,
        userId: user.id,
        userName: user.name,
      } as VoteExtract)
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
  encrypted: null,
  locked: false,
});

describe('Session Permission Logic', () => {
  it('When using default rules, with a logged in user', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreatePost).toBe(true);
    expect(result.canCreateGroup).toBe(true);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a logged out user (no user)', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, null, true, false);
    expect(result.canCreatePost).toBe(false);
    expect(result.canCreateGroup).toBe(false);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a user who doesnt have the encryption key', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, currentUser, false, false);
    expect(result.canCreatePost).toBe(false);
    expect(result.canCreateGroup).toBe(false);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a user who is disabled', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, currentUser, true, true);
    expect(result.canCreatePost).toBe(false);
    expect(result.canCreateGroup).toBe(false);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a limit of posts but under the limit', () => {
    const p1 = post(currentUser);
    const p2 = post(currentUser);
    const p3 = post(currentUser);
    const p4 = post(currentUser); // 4 posts by current user
    const p5 = post(anotherUser); // Another user
    const s = session({ ...defaultOptions, maxPosts: 5 }, p1, p2, p3, p4, p5);
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreatePost).toBe(true);
    expect(result.canCreateGroup).toBe(true);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a limit of posts reached', () => {
    const p1 = post(currentUser);
    const p2 = post(currentUser);
    const p3 = post(currentUser);
    const p4 = post(currentUser); // 4 posts by current user
    const p5 = post(anotherUser); // Another user
    const s = session({ ...defaultOptions, maxPosts: 4 }, p1, p2, p3, p4, p5);
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreatePost).toBe(false);
    expect(result.canCreateGroup).toBe(false);
    expect(result.hasReachedMaxPosts).toBe(true);
  });

  it('When using default rules, when not allowing grouping', () => {
    const s = session({ ...defaultOptions, allowGrouping: false });
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreatePost).toBe(true);
    expect(result.canCreateGroup).toBe(false);
    expect(result.hasReachedMaxPosts).toBe(false);
  });
});

describe('Posts Permission Logic', () => {
  it('When using default rules, a user on its own post', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(true);
    expect(result.canDelete).toBe(true);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When using default rules, a non-logged in user', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, null);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When using default rules, a user on another users post', () => {
    const p = post(anotherUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When using default rules, a user on another users post but already voted', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p2, s, currentUser);
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
    const result = postPermissionLogic(p3, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(true);
    expect(result.canDelete).toBe(true);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(true);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When dis-allowing down-votes', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowMultipleVotes: true,
        maxDownVotes: 0,
      },
      p
    );
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(true);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(false);
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
    const result = postPermissionLogic(p, s, currentUser);
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
    const result = postPermissionLogic(p, s, currentUser);
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
    const result = postPermissionLogic(p, s, currentUser);
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
    const result = postPermissionLogic(p, s, currentUser);
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
    const result = postPermissionLogic(p, s, currentUser);
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
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.canCreateGroup).toBe(false);
  });

  it('When cards are not blurred, for another user card', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: false,
      },
      p
    );
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.isBlurred).toBe(false);
  });

  it('When cards are blurred, for another user card', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: true,
      },
      p
    );
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.isBlurred).toBe(true);
  });

  it('When cards are blurred, for the current user card', () => {
    const p = post(currentUser, [anotherUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: true,
      },
      p
    );
    const result = postPermissionLogic(p, s, currentUser);
    expect(result.isBlurred).toBe(false);
  });
});
