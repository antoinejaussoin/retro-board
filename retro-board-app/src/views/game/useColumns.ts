import { useMemo } from 'react';
import { sortBy } from 'lodash';
import useTranslations from '../../translations';
import useGlobalState from '../../state';
import { ColumnContent } from '../game/types';
import { extrapolate } from '../../state/columns';

export default function useColumns() {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const { session } = state;
  const posts = session ? session.posts : [];
  const groups = session ? session.groups : [];
  const cols = session ? session.columns : [];

  const columns: ColumnContent[] = useMemo(
    () =>
      cols
        .map(col => extrapolate(col, translations))
        .map(
          (col, index) =>
            ({
              index,
              posts: sortBy(
                posts.filter(p => p.column === index && p.group === null),
                p => p.rank
              ),
              groups: groups
                .filter(p => p.column === index)
                .map(group => ({
                  ...group,
                  posts: sortBy(
                    posts.filter(p => !!p.group && p.group.id === group.id),
                    p => p.rank
                  ),
                })),
              ...col,
            } as ColumnContent)
        ),
    [posts, groups, cols, translations]
  );
  return columns;
}
