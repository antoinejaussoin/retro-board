import { Post, PostGroup, Session, User } from 'common';
import sortBy from 'lodash/sortBy';
import flattenDeep from 'lodash/flattenDeep';
import { ColumnContent } from '../types';
import { ColumnStats, ColumnStatsItem, Stats, ActionItem } from './types';
import { countVotes, countVotesForGroup } from '../utils';
import { postPermissionLogic } from '../board/permissions-logic';
import { useMemo } from 'react';
import useUser from '../../../auth/useUser';
import useSession from '../useSession';

export function useSummary(columns: ColumnContent[]): Stats {
  const { session } = useSession();
  const user = useUser();

  const results = useMemo(() => {
    return {
      columns: columns.map((c) => calculateColumn(c, user, session)),
      actions: buildActions(columns),
    };
  }, [columns, user, session]);

  return results;
}

function calculateColumn(
  column: ColumnContent,
  user: User | null,
  session: Session | null
): ColumnStats {
  const posts: ColumnStatsItem[] = column.posts.map((p) =>
    postToItem(p, user, session)
  );
  const groups: ColumnStatsItem[] = column.groups
    .filter((g) => !!g.posts.length)
    .map((g) => groupToItem(g, user, session));
  return { items: sortBy([...posts, ...groups], sortingFunction), column };
}

function postToItem(
  post: Post,
  user: User | null,
  session: Session | null
): ColumnStatsItem {
  const permissions = postPermissionLogic(post, session, user);
  return {
    id: post.id,
    content: post.content,
    user: permissions.canShowAuthor ? post.user : null,
    type: 'post',
    children: [],
    likes: countVotes(post, 'like'),
    dislikes: countVotes(post, 'dislike'),
    post,
  };
}

function groupToItem(
  group: PostGroup,
  user: User | null,
  session: Session | null
): ColumnStatsItem {
  return {
    id: group.id,
    content: group.label,
    user: group.user,
    type: 'group',
    children: sortBy(
      group.posts.map((p) => postToItem(p, user, session)),
      sortingFunction
    ),
    likes: countVotesForGroup(group, 'like'),
    dislikes: countVotesForGroup(group, 'dislike'),
    group,
  };
}

function buildActions(columns: ColumnContent[]): ActionItem[] {
  return getAllPosts(columns).map((p) => ({
    action: p.action!,
    postContent: p.content,
    postId: p.id,
  }));
}

function getAllPosts(columns: ColumnContent[]): Post[] {
  return [
    ...flattenDeep(columns.map((c) => c.posts.filter((p) => !!p.action))),
    ...flattenDeep(
      columns.map((c) => c.groups.map((g) => g.posts.filter((p) => !!p.action)))
    ),
  ];
}

function sortingFunction(item: ColumnStatsItem) {
  return -(item.likes - item.dislikes);
}
