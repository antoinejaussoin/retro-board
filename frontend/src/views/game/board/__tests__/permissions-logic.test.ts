import {
  type BackendCapabilities,
  type Post,
  type Session,
  type SessionOptions,
  type User,
  type VoteExtract,
  type VoteType,
  defaultOptions,
} from 'common';
import { v4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import {
  postPermissionLogic,
  sessionPermissionLogic,
} from '../permissions-logic';

const userBase: User = {
  photo: null,
  id: '0',
  name: 'name',
  email: null,
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

const capabilities: BackendCapabilities = {
  adminEmail: 'admin@acme.com',
  ai: false,
  disableAccountDeletion: false,
  disableAnonymous: false,
  disablePasswordRegistration: false,
  disablePasswords: false,
  disableShowAuthor: false,
  emailAvailable: true,
  licenced: true,
  oAuth: {
    github: false,
    google: false,
    microsoft: false,
    okta: false,
    slack: false,
    twitter: false,
  },
  selfHosted: false,
  slackClientId: 'xxx',
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
      }) as VoteExtract,
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
  moderator: currentUser,
  options: {
    ...options,
  },
  groups: [],
  encrypted: null,
  locked: false,
  messages: [],
  ready: [],
  timer: null,
  demo: false,
});

describe('Session Permission Logic', () => {
  it('When using default rules, with a logged in user', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreatePost).toBe(true);
    expect(result.canCreateGroup).toBe(true);
    expect(result.hasReachedMaxPosts).toBe(false);
  });

  it('When using default rules, with a logged in user, but readonly', () => {
    const s = session(defaultOptions);
    const result = sessionPermissionLogic(s, currentUser, true, true);
    expect(result.canCreatePost).toBe(false);
    expect(result.canCreateGroup).toBe(false);
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

  it('When restricting grouping to owner', () => {
    const s = session({
      ...defaultOptions,
      allowGrouping: true,
      restrictGroupingToModerator: true,
    });
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canCreateGroup).toBe(true);
    const forAnotherUser = sessionPermissionLogic(s, anotherUser, true, false);
    expect(forAnotherUser.canCreateGroup).toBe(false);
  });

  it('When restricting editing the title to owner', () => {
    const s = session({
      ...defaultOptions,
      restrictTitleEditToModerator: true,
    });
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canEditTitle).toBe(true);
    const forAnotherUser = sessionPermissionLogic(s, anotherUser, true, false);
    expect(forAnotherUser.canEditTitle).toBe(false);
  });

  it('When restricting re-ordering to owner', () => {
    const s = session({
      ...defaultOptions,
      restrictReorderingToModerator: true,
    });
    const result = sessionPermissionLogic(s, currentUser, true, false);
    expect(result.canReorderPosts).toBe(true);
    const forAnotherUser = sessionPermissionLogic(s, anotherUser, true, false);
    expect(forAnotherUser.canReorderPosts).toBe(false);
  });
});

describe('Posts Permission Logic', () => {
  it('When using default rules, a user on its own post', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canCreateAction).toBe(true);
    expect(result.canEdit).toBe(true);
    expect(result.canDelete).toBe(true);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When using default rules, a user on its own post, but set to readonly', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, capabilities, currentUser, true);
    expect(result.canCreateAction).toBe(false);
    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
    expect(result.canDownVote).toBe(false);
    expect(result.canUpVote).toBe(false);
    expect(result.canDisplayUpVote).toBe(true);
    expect(result.canDisplayDownVote).toBe(true);
  });

  it('When using default rules, a non-logged in user', () => {
    const p = post(currentUser);
    const s = session(defaultOptions, p);
    const result = postPermissionLogic(p, s, capabilities, null, false);
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
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p2,
    );
    const result = postPermissionLogic(p2, s, capabilities, currentUser, false);
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
      p3,
    );
    const result = postPermissionLogic(p3, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
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
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canUseGiphy).toBe(true);
  });

  it('When disallowing Giphy', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowGiphy: false,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canUseGiphy).toBe(false);
  });

  it('When allowing reordering', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowReordering: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canReorder).toBe(true);
  });

  it('When disallowing reordering', () => {
    const p = post(anotherUser, [currentUser, currentUser, currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowReordering: false,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canReorder).toBe(false);
  });

  it('When cards are not blurred, for another user card', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: false,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.isBlurred).toBe(false);
  });

  it('When cards are blurred, for another user card', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.isBlurred).toBe(true);
  });

  it('When cards are blurred, for the current user card', () => {
    const p = post(currentUser, [anotherUser]);
    const s = session(
      {
        ...defaultOptions,
        blurCards: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.isBlurred).toBe(false);
  });

  it('When votes can be cancelled', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowCancelVote: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canCancelVote).toBe(true);
  });

  it(`When votes can be cancelled but there aren't any vote`, () => {
    const p = post(anotherUser, [currentUser]);
    p.votes = [];
    const s = session(
      {
        ...defaultOptions,
        allowCancelVote: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canCancelVote).toBe(false);
  });

  it('When votes cannot be cancelled', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowCancelVote: false,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canCancelVote).toBe(false);
  });

  it('By default it should not show authors', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canShowAuthor).toBe(false);
  });

  it('If show author is enabled', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowAuthorVisible: true,
      },
      p,
    );
    const result = postPermissionLogic(p, s, capabilities, currentUser, false);
    expect(result.canShowAuthor).toBe(true);
  });

  it('If show author is restricted across the board', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowAuthorVisible: true,
      },
      p,
    );
    const c: BackendCapabilities = {
      ...capabilities,
      disableShowAuthor: true,
    };
    const result = postPermissionLogic(p, s, c, currentUser, false);
    expect(result.canShowAuthor).toBe(false);
  });

  it('Can re-order if restricted to owner and not owner', () => {
    const p = post(anotherUser, [currentUser]);
    const s = session(
      {
        ...defaultOptions,
        allowReordering: true,
        restrictReorderingToModerator: true,
      },
      p,
    );
    const forOwner = postPermissionLogic(
      p,
      s,
      capabilities,
      currentUser,
      false,
    );
    expect(forOwner.canReorder).toBe(true);
    const forAnotherUser = postPermissionLogic(
      p,
      s,
      capabilities,
      anotherUser,
      false,
    );
    expect(forAnotherUser.canReorder).toBe(false);
  });
});
