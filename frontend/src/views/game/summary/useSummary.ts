import type {
  BackendCapabilities,
  Post,
  PostGroup,
  Session,
  User,
} from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import flattenDeep from 'lodash/flattenDeep';
import sortBy from 'lodash/sortBy';
import { useMemo } from 'react';
import useUser from '../../../state/user/useUser';
import { postPermissionLogic } from '../board/permissions-logic';
import type { ColumnContent } from '../types';
import useSession from '../useSession';
import { countVotes, countVotesForGroup } from '../utils';
import type { ActionItem, ColumnStats, ColumnStatsItem, Stats } from './types';

export function useSummary(columns: ColumnContent[]): Stats {
  const { session } = useSession();
  const user = useUser();
  const capabilities = useBackendCapabilities();

  const results = useMemo(() => {
    return {
      columns: columns.map((c) =>
        calculateColumn(c, user, session, capabilities),
      ),
      actions: buildActions(columns),
    };
  }, [columns, user, session, capabilities]);

  return results;
}

function calculateColumn(
  column: ColumnContent,
  user: User | null,
  session: Session | null,
  capabilities: BackendCapabilities,
): ColumnStats {
  const posts: ColumnStatsItem[] = column.posts.map((p) =>
    postToItem(p, user, session, capabilities),
  );
  const groups: ColumnStatsItem[] = column.groups
    .filter((g) => !!g.posts.length)
    .map((g) => groupToItem(g, user, session, capabilities));
  return { items: sortBy([...posts, ...groups], sortingFunction), column };
}

function postToItem(
  post: Post,
  user: User | null,
  session: Session | null,
  capabilities: BackendCapabilities,
): ColumnStatsItem {
  const permissions = postPermissionLogic(
    post,
    session,
    capabilities,
    user,
    false,
  );
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
  session: Session | null,
  capabilities: BackendCapabilities,
): ColumnStatsItem {
  return {
    id: group.id,
    content: group.label,
    user: group.user,
    type: 'group',
    children: sortBy(
      group.posts.map((p) => postToItem(p, user, session, capabilities)),
      sortingFunction,
    ),
    likes: countVotesForGroup(group, 'like'),
    dislikes: countVotesForGroup(group, 'dislike'),
    group,
  };
}

function buildActions(columns: ColumnContent[]): ActionItem[] {
  return getAllPosts(columns).map((p) => ({
    action: p.action as string,
    postContent: p.content,
    postId: p.id,
  }));
}

function getAllPosts(columns: ColumnContent[]): Post[] {
  return [
    ...flattenDeep(columns.map((c) => c.posts.filter((p) => !!p.action))),
    ...flattenDeep(
      columns.map((c) =>
        c.groups.map((g) => g.posts.filter((p) => !!p.action)),
      ),
    ),
  ];
}

function sortingFunction(item: ColumnStatsItem) {
  return -(item.likes - item.dislikes);
}
