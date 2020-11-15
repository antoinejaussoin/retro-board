import { useMemo } from 'react';
import { flatten, sortedUniq, sortBy } from 'lodash';
import { format } from 'date-fns';
import useGlobalState from '../../../state';
import useColumns from '../useColumns';
import useTranslations, { useLanguage } from '../../../translations';
import { calculateSummary } from './calculate-summary';
import { ColumnStatsItem, ActionItem } from './types';

export default function useMarkdown() {
  const { state } = useGlobalState();
  const columns = useColumns();
  const language = useLanguage();
  const translations = useTranslations();
  const stats = calculateSummary(columns);

  const result = useMemo(() => {
    if (!state.session) {
      return '';
    }

    const { session } = state;

    const participants = sortedUniq(
      sortBy(
        flatten(
          session.posts.map((p) => [
            p.user.name,
            ...p.votes.map((v) => v.user.name),
          ])
        )
      )
    ).join(', ');
    const numberOfVotes = session.posts.reduce((prev, cur) => {
      return prev + cur.votes.length;
    }, 0);

    let md = `
# Retrospected Session

## ${session.name || translations.SessionName.defaultSessionName}

### Session details:

**Date**: ${format(new Date(), 'PPPPpppp', { locale: language.dateLocale })}

**URL**: ${window.location.href.replace('/summary', '')}

**Participants**: ${participants}

**Posts**: ${session.posts.length}

**Votes**: ${numberOfVotes}

### Actions

${stats.actions.map(toAction).join('\n')}

### Posts
`;

    stats.columns.forEach((col) => {
      md += `
  
#### ${col.column.label}

${[...col.items].map((i) => toItem(i, 0)).join('\n')}
`;
    });

    return md;
  }, [
    state,
    translations.SessionName.defaultSessionName,
    language.dateLocale,
    stats,
  ]);
  return result;
}

function toItem(item: ColumnStatsItem, depth: number) {
  const highlight = item.type === 'group' ? '**' : '';
  let content = `${'\t'.repeat(depth)}- (+${item.likes}/-${
    item.dislikes
  }) ${highlight}${item.content}${highlight}`;
  item.children.forEach((child) => {
    content += '\n' + toItem(child, depth + 1);
  });

  return toMultiline(content);
}

function toAction(action: ActionItem): string {
  return `- ${action.action}`;
}

function toMultiline(content: string) {
  return content.replace(/(?:\r\n|\r|\n)/g, '  \n    ');
}
