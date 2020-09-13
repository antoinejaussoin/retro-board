import { Post, Session, User, VoteType } from 'retro-board-common';
import { some } from 'lodash';

export interface UserPermissions {
  canUpVote: boolean;
  canDownVote: boolean;
  canCreateAction: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShowAuthor: boolean;
  canUseGiphy: boolean;
  canReorder: boolean;
  canCreateGroup: boolean;
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
      canReorder: false,
      canCreateGroup: false,
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
  const canEdit = isLoggedIn && isAuthor;
  const canDelete = isLoggedIn && isAuthor;
  const canShowAuthor = allowAuthorVisible;
  const canUseGiphy = isLoggedIn && allowGiphy;
  const canReorder = isLoggedIn && allowReordering;
  const canCreateGroup = isLoggedIn && allowGrouping;

  return {
    canCreateAction,
    canDownVote,
    canUpVote,
    canEdit,
    canDelete,
    canShowAuthor,
    canUseGiphy,
    canCreateGroup,
    canReorder,
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
