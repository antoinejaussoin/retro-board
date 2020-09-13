import { ColumnContent } from './types';
import { Post, PostGroup } from 'retro-board-common';
import { flattenDeep } from 'lodash';
import { getMiddle, getPrevious, getNext, getBetween } from './lexorank';

interface MovingEntities {
  post: Post;
  previous?: Post;
  next?: Post;
  targetGroup: PostGroup | null;
  targetColumn: number;
  targetIndex: number;
}

interface CombiningEntities {
  post1: Post;
  post2: Post;
}

export function calculateRank(previous?: Post, next?: Post): string {
  if (!previous && !next) {
    return getMiddle();
  }
  if (!previous && next) {
    return getPrevious(next.rank);
  }
  if (previous && !next) {
    return getNext(previous.rank);
  }
  if (previous && next) {
    return getBetween(previous.rank, next.rank);
  }
  throw Error('This should not be possible');
}

export function getCombiningEntities(
  postId1: string,
  postId2: string,
  columns: ColumnContent[]
): CombiningEntities | null {
  const post1 = findPost(columns, postId1);
  const post2 = findPost(columns, postId2);

  if (post1 && post2) {
    return { post1, post2 };
  }

  return null;
}

export function getMovingEntities(
  postId: string,
  targetId: string,
  targetIndex: number,
  columns: ColumnContent[]
): MovingEntities | null {
  const post = findPost(columns, postId);
  const type = targetId.split('#')[0];
  const id = targetId.split('#')[1];
  if (post && type === 'group') {
    const targetGroup = findGroup(columns, id);
    const targetColumn = findColumIndexForGroup(columns, id);
    if (targetGroup) {
      const postsWithoutSource = targetGroup.posts.filter(p => p !== post);
      return {
        post,
        previous:
          targetIndex !== 0 ? postsWithoutSource[targetIndex - 1] : undefined,
        next:
          targetIndex !== postsWithoutSource.length
            ? postsWithoutSource[targetIndex]
            : undefined,
        targetGroup,
        targetColumn,
        targetIndex,
      };
    }
  }
  if (post && type === 'column') {
    const targetColumn = +id;
    const column = columns[targetColumn];
    const postsWithoutSource = column.posts.filter(p => p !== post);
    return {
      post,
      previous:
        targetIndex !== 0 ? postsWithoutSource[targetIndex - 1] : undefined,
      next:
        targetIndex !== postsWithoutSource.length
          ? postsWithoutSource[targetIndex]
          : undefined,
      targetGroup: null,
      targetColumn,
      targetIndex,
    };
  }
  return null;
}

function findPost(columns: ColumnContent[], postId: string): Post | undefined {
  const allPosts = flattenDeep([
    ...columns.map(col => col.posts),
    ...columns.map(col => col.groups.map(group => group.posts)),
  ]);
  return allPosts.find(post => post.id === postId);
}

function findGroup(
  columns: ColumnContent[],
  groupId: string
): PostGroup | undefined {
  return flattenDeep(columns.map(col => col.groups)).find(
    group => group.id === groupId
  );
}

function findColumIndexForGroup(columns: ColumnContent[], groupId: string) {
  return columns.findIndex(col => col.groups.find(g => g.id === groupId));
}
