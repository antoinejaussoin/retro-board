import type { ColumnDefinition, Post, PostGroup } from 'common';
import sortBy from 'lodash/sortBy';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { extrapolate } from '../../state/columns';
import type { ColumnContent } from './types';
import useSession from './useSession';

const emptyPosts: Post[] = [];
const emptyGroups: PostGroup[] = [];
const emptyCols: ColumnDefinition[] = [];

export default function useColumns() {
  const { t } = useTranslation();
  const { session } = useSession();
  const posts = session ? session.posts : emptyPosts;
  const groups = session ? session.groups : emptyGroups;
  const cols = session ? session.columns : emptyCols;

  const columns: ColumnContent[] = useMemo(
    () =>
      cols
        .map((col) => extrapolate(col, t))
        .map(
          (col, index) =>
            ({
              index,
              posts: sortBy(
                posts.filter((p) => p.column === index && p.group === null),
                (p) => p.rank,
              ),
              groups: groups
                .filter((p) => p.column === index)
                .map((group) => ({
                  ...group,
                  posts: sortBy(
                    posts.filter((p) => !!p.group && p.group.id === group.id),
                    (p) => p.rank,
                  ),
                })),
              ...col,
            }) as ColumnContent,
        ),
    [posts, groups, cols, t],
  );
  return columns;
}
