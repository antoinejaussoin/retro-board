import type {
  BackendCapabilities,
  Post,
  Session,
  User,
  VoteType,
} from 'common';
import some from 'lodash/some';

export interface SessionUserPermissions {
  canCreatePost: boolean;
  canCreateGroup: boolean;
  canEditTitle: boolean;
  canReorderPosts: boolean;
  hasReachedMaxPosts: boolean;
}

export function sessionPermissionLogic(
  session: Session | null,
  user: User | null,
  canDecrypt: boolean,
  readonly: boolean,
): SessionUserPermissions {
  if (!session || !user) {
    return {
      canCreatePost: false,
      canCreateGroup: false,
      canEditTitle: false,
      canReorderPosts: false,
      hasReachedMaxPosts: false,
    };
  }
  const isModerator = user.id === session.moderator.id;
  const isOwner = isModerator || user.id === session.createdBy.id;

  const numberOfPosts = session.posts.filter(
    (p) => p.user.id === user.id,
  ).length;

  const hasReachedMaxPosts =
    session.options.maxPosts !== null &&
    session.options.maxPosts <= numberOfPosts;
  const canCreatePost = canDecrypt && !readonly && !hasReachedMaxPosts;
  const canCreateGroup =
    canCreatePost &&
    session.options.allowGrouping &&
    (isOwner || !session.options.restrictGroupingToModerator);
  const canEditTitle =
    !readonly && (isOwner || !session.options.restrictTitleEditToModerator);
  const canReorderPosts =
    !readonly && (isOwner || !session.options.restrictReorderingToModerator);

  return {
    canCreatePost,
    canCreateGroup,
    canEditTitle,
    canReorderPosts,
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
  canCancelVote: boolean;
  isBlurred: boolean;
}

export function postPermissionLogic(
  post: Post,
  session: Session | null,
  capabilities: BackendCapabilities,
  user: User | null,
  readonly: boolean,
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
    allowReordering,
    allowCancelVote,
    restrictReorderingToModerator: restrictReorderingToOwner,
    blurCards,
  } = session.options;

  const isLoggedIn = !!user;
  const canCreateAction = !readonly && isLoggedIn && allowActions;
  const userId = user ? user.id : -1;
  const isAuthor = user ? user.id === post.user.id : false;
  const isOwner = user ? user.id === session.createdBy.id : false;
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
  const canShowAuthor = allowAuthorVisible && !capabilities.disableShowAuthor;
  const canUseGiphy = isLoggedIn && allowGiphy;
  const canReorder =
    !readonly &&
    isLoggedIn &&
    allowReordering &&
    (isOwner || !restrictReorderingToOwner);
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
    canReorder,
    canCancelVote,
    isBlurred,
  };
}

export function numberOfVotes(
  type: VoteType,
  userId: string | number,
  session: Session,
) {
  return session.posts.reduce<number>((prev, cur) => {
    return (
      prev +
      cur.votes.filter((v) => v.userId === userId && v.type === type).length
    );
  }, 0);
}
