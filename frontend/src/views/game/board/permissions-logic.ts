import { Post, Session, User, VoteType } from 'common';
import some from 'lodash/some';

export interface SessionUserPermissions {
  canCreatePost: boolean;
  canCreateGroup: boolean;
  hasReachedMaxPosts: boolean;
}

export function sessionPermissionLogic(
  session: Session | null,
  user: User | null,
  canDecrypt: boolean,
  readonly: boolean
): SessionUserPermissions {
  const numberOfPosts =
    session && user
      ? session.posts.filter((p) => p.user.id === user.id).length
      : 0;

  const hasReachedMaxPosts =
    !!session &&
    session.options.maxPosts !== null &&
    session.options.maxPosts <= numberOfPosts;
  const canCreatePost =
    !!user && canDecrypt && !readonly && !hasReachedMaxPosts;
  const canCreateGroup =
    canCreatePost && !!session && session.options.allowGrouping;

  return {
    canCreatePost,
    canCreateGroup,
    hasReachedMaxPosts,
  };
}

export interface PostUserPermissions {
  canUpVote: boolean;
  canDownVote: boolean;
  canDisplayUpVote: boolean;
  canDisplayDownVote: boolean;
  canCreateAction: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShowAuthor: boolean;
  canUseGiphy: boolean;
  canReorder: boolean;
  canCreateGroup: boolean;
  canCancelVote: boolean;
  isBlurred: boolean;
}

export function postPermissionLogic(
  post: Post,
  session: Session | null,
  user: User | null,
  readonly: boolean
): PostUserPermissions {
  if (!session) {
    return {
      canCreateAction: false,
      canDelete: false,
      canDownVote: false,
      canEdit: false,
      canShowAuthor: false,
      canUpVote: false,
      canUseGiphy: false,
      canDisplayDownVote: false,
      canDisplayUpVote: false,
      canReorder: false,
      canCreateGroup: false,
      canCancelVote: false,
      isBlurred: false,
    };
  }
  const {
    maxDownVotes,
    maxUpVotes,
    allowActions,
    allowSelfVoting,
    allowMultipleVotes,
    allowAuthorVisible,
    allowGiphy,
    allowGrouping,
    allowReordering,
    allowCancelVote,
    blurCards,
  } = session.options;

  const isLoggedIn = !!user;
  const canCreateAction = !readonly && isLoggedIn && allowActions;
  const userId = user ? user.id : -1;
  const isAuthor = user ? user.id === post.user.id : false;
  const canPotentiallyVote =
    !readonly && isLoggedIn && allowSelfVoting ? true : !isAuthor;
  const hasVoted = some(post.votes, (u) => u.userId === userId);
  const hasVotedOrAuthor =
    (!allowMultipleVotes &&
      some(post.votes, (u) => u.userId === userId && u.type === 'like')) ||
    (!allowMultipleVotes &&
      some(post.votes, (u) => u.userId === userId && u.type === 'dislike')) ||
    !canPotentiallyVote;
  const upVotes = numberOfVotes('like', userId, session);
  const downVotes = numberOfVotes('dislike', userId, session);
  const hasMaxedUpVotes = maxUpVotes === null ? false : upVotes >= maxUpVotes;
  const hasMaxedDownVotes =
    maxDownVotes === null ? false : downVotes >= maxDownVotes;
  const canUpVote =
    !readonly && isLoggedIn && !hasVotedOrAuthor && !hasMaxedUpVotes;
  const canDownVote =
    !readonly && isLoggedIn && !hasVotedOrAuthor && !hasMaxedDownVotes;
  const canDisplayUpVote = maxUpVotes !== null ? maxUpVotes > 0 : true;
  const canDisplayDownVote = maxDownVotes !== null ? maxDownVotes > 0 : true;
  const canEdit = !readonly && isLoggedIn && isAuthor;
  const canDelete = !readonly && isLoggedIn && isAuthor;
  const canShowAuthor = allowAuthorVisible;
  const canUseGiphy = isLoggedIn && allowGiphy;
  const canReorder = !readonly && isLoggedIn && allowReordering;
  const canCreateGroup = !readonly && isLoggedIn && allowGrouping;
  const canCancelVote = !readonly && hasVoted && allowCancelVote;
  const isBlurred = blurCards && !isAuthor;

  return {
    canCreateAction,
    canDownVote,
    canUpVote,
    canDisplayDownVote,
    canDisplayUpVote,
    canEdit,
    canDelete,
    canShowAuthor,
    canUseGiphy,
    canCreateGroup,
    canReorder,
    canCancelVote,
    isBlurred,
  };
}

export function numberOfVotes(
  type: VoteType,
  userId: string | number,
  session: Session
) {
  return session.posts.reduce<number>((prev, cur) => {
    return (
      prev +
      cur.votes.filter((v) => v.userId === userId && v.type === type).length
    );
  }, 0);
}
