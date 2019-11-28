import { useMemo } from 'react';
import useTranslations from '../../translations';
import useGlobalState from '../../state';
import { ColumnContent } from '../game/types';
import { extrapolate } from '../../state/columns';

export default function useColumns() {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const { session } = state;
  const posts = session ? session.posts : [];
  const cols = session ? session.columns : [];

  const columns: ColumnContent[] = useMemo(
    () =>
      cols
        .map(col => extrapolate(col, translations))
        .map(
          (col, index) =>
            ({
              index,
              posts: posts.filter(p => p.column === index),
              ...col,
            } as ColumnContent)
        ),
    [posts, cols, translations]
  );
  return columns;
}
