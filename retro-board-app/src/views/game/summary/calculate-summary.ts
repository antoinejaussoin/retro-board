import { Post, PostGroup } from 'retro-board-common';
import { sortBy, flattenDeep } from 'lodash';
import { ColumnContent } from '../types';
import { ColumnStats, ColumnStatsItem, Stats, ActionItem } from './types';
import { countVotes, countVotesForGroup } from '../utils';

export function calculateSummary(columns: ColumnContent[]): Stats {
  return {
    columns: columns.map(calculateColumn),
    actions: buildActions(columns),
  };
}

function calculateColumn(column: ColumnContent): ColumnStats {
  const posts: ColumnStatsItem[] = column.posts.map(postToItem);
  const groups: ColumnStatsItem[] = column.groups
    .filter(g => !!g.posts.length)
    .map(groupToItem);
  return { items: sortBy([...posts, ...groups], sortingFunction), column };
}

function postToItem(post: Post): ColumnStatsItem {
  return {
    id: post.id,
    content: post.content,
    type: 'post',
    children: [],
    likes: countVotes(post, 'like'),
    dislikes: countVotes(post, 'dislike'),
  };
}

function groupToItem(group: PostGroup): ColumnStatsItem {
  return {
    id: group.id,
    content: group.label,
    type: 'group',
    children: sortBy(group.posts.map(postToItem), sortingFunction),
    likes: countVotesForGroup(group, 'like'),
    dislikes: countVotesForGroup(group, 'dislike'),
  };
}

function buildActions(columns: ColumnContent[]): ActionItem[] {
  return getAllPosts(columns).map(p => ({
    action: p.action!,
    postContent: p.content,
    postId: p.id,
  }));
}

function getAllPosts(columns: ColumnContent[]): Post[] {
  return [
    ...flattenDeep(columns.map(c => c.posts.filter(p => !!p.action))),
    ...flattenDeep(
      columns.map(c => c.groups.map(g => g.posts.filter(p => !!p.action)))
    ),
  ];
}

function sortingFunction(item: ColumnStatsItem) {
  return -(item.likes - item.dislikes);
}
