import { Post, Session, User, VoteType } from '@retrospected/common';
import some from 'lodash/some';

export interface UserPermissions {
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
  isBlurred: boolean;
}

export function permissionLogic(
  post: Post,
  session: Session | null,
  user: User | null
): UserPermissions {
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
    blurCards,
  } = session.options;

  const isLoggedIn = !!user;
  const canCreateAction = isLoggedIn && allowActions;
  const userId = user ? user.id : -1;
  const isAuthor = user ? user.id === post.user.id : false;
  const canPotentiallyVote = isLoggedIn && allowSelfVoting ? true : !isAuthor;
  const hasVotedOrAuthor =
    (!allowMultipleVotes &&
      some(post.votes, (u) => u.user.id === userId && u.type === 'like')) ||
    (!allowMultipleVotes &&
      some(post.votes, (u) => u.user.id === userId && u.type === 'dislike')) ||
    !canPotentiallyVote;
  const upVotes = numberOfVotes('like', userId, session);
  const downVotes = numberOfVotes('dislike', userId, session);
  const hasMaxedUpVotes = maxUpVotes === null ? false : upVotes >= maxUpVotes;
  const hasMaxedDownVotes =
    maxDownVotes === null ? false : downVotes >= maxDownVotes;
  const canUpVote = isLoggedIn && !hasVotedOrAuthor && !hasMaxedUpVotes;
  const canDownVote = isLoggedIn && !hasVotedOrAuthor && !hasMaxedDownVotes;
  const canDisplayUpVote = maxUpVotes !== null ? maxUpVotes > 0 : true;
  const canDisplayDownVote = maxDownVotes !== null ? maxDownVotes > 0 : true;
  const canEdit = isLoggedIn && isAuthor;
  const canDelete = isLoggedIn && isAuthor;
  const canShowAuthor = allowAuthorVisible;
  const canUseGiphy = isLoggedIn && allowGiphy;
  const canReorder = isLoggedIn && allowReordering;
  const canCreateGroup = isLoggedIn && allowGrouping;
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
      cur.votes.filter((v) => v.user.id === userId && v.type === type).length
    );
  }, 0);
}
