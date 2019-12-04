import { useMemo } from 'react';
import { flatten, sortedUniq, sortBy } from 'lodash';
import { format } from 'date-fns';
import useGlobalState from '../../../state';
import useColumns from '../useColumns';
import useTranslations from '../../../translations';
import { Post } from 'retro-board-common';
import { sortPostByVote } from '../utils';

export default function useMarkdown() {
  const { state } = useGlobalState();
  const columns = useColumns();
  const translations = useTranslations();

  const result = useMemo(() => {
    if (!state.session) {
      return '';
    }

    const { session } = state;

    const participants = sortedUniq(
      sortBy(
        flatten(
          session.posts.map(p => [
            p.user.name,
            ...p.votes.map(v => v.user.name),
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

**Date**: ${format(new Date(), 'PPPPpppp')}

**URL**: ${window.location.href.replace('/summary', '')}

**Participants**: ${participants}

**Posts**: ${session.posts.length}

**Votes**: ${numberOfVotes}

### Posts
`;

    columns.forEach(col => {
      md += `
  
#### ${col.label}

${[...col.posts]
  .sort(sortPostByVote)
  .map(toPost)
  .join('\n')}
`;
    });

    return md;
  }, [columns, state, translations.SessionName.defaultSessionName]);
  return result;
}

function toPost(post: Post): string {
  const positivesVotes = post.votes.filter(p => p.type === 'like').length;
  const negativeVotes = post.votes.filter(p => p.type === 'dislike').length;
  let content = toMultiline(
    `- (+${positivesVotes}/-${negativeVotes}) ${post.content}`
  );

  if (post.action) {
    content += `\n  - Action: ${toMultiline(post.action)}`;
  }
  return content;
}

function toMultiline(content: string) {
  return content.replace(/(?:\r\n|\r|\n)/g, '  \n    ');
}
