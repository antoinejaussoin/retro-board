import { useMemo } from 'react';
import flatten from 'lodash/flatten';
import sortedUniq from 'lodash/sortedUniq';
import sortBy from 'lodash/sortBy';
import { format } from 'date-fns';
import useColumns from '../useColumns';
import { useTranslation } from 'react-i18next';
import { useSummary } from './useSummary';
import { ColumnStatsItem, ActionItem } from './types';
import useSession from '../useSession';

export default function useMarkdown() {
  const { session } = useSession();
  const columns = useColumns();
  const { t } = useTranslation();
  const stats = useSummary(columns);

  const result = useMemo(() => {
    if (!session) {
      return '';
    }

    const participants = sortedUniq(
      sortBy(
        flatten(
          session.posts.map((p) => [
            p.user.name,
            ...p.votes.map((v) => v.userName),
          ])
        )
      )
    ).join(', ');
    const numberOfVotes = session.posts.reduce((prev, cur) => {
      return prev + cur.votes.length;
    }, 0);

    let md = `
# Retrospected Session

## ${session.name || t('SessionName.defaultSessionName')}

### Session details:

**Date**: ${format(new Date(), 'PPPPpppp')}

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
  }, [session, t, stats]);
  return result;
}

function toItem(item: ColumnStatsItem, depth: number) {
  const highlight = item.type === 'group' ? '**' : '';
  let content = `${' '.repeat(depth * 2)}* (+${item.likes}/-${
    item.dislikes
  }) ${highlight}${toMultiline(item.content)}${highlight}`;
  if (item.post && item.post.action) {
    content += `\n${' '.repeat((depth + 1) * 2)}* **Action**: *${toMultiline(
      item.post.action
    )}*`;
  }
  item.children.forEach((child) => {
    content += '\n' + toItem(child, depth + 1);
  });

  return content;
}

function toAction(action: ActionItem): string {
  return `- ${toMultiline(action.action)}`;
}

function toMultiline(content: string) {
  return content.replace(/(?:\r\n|\r|\n)/g, '  \n');
}
