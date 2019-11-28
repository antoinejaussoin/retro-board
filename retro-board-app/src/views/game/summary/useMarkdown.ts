import { useMemo } from 'react';
import { flatten, sortedUniq, sortBy } from 'lodash';
import moment from 'moment';
import useGlobalState from '../../../state';
import useColumns from '../useColumns';
import useTranslations from '../../../translations';
import { Post } from 'retro-board-common';

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

**Date**: ${moment().format('LLLL')}

**URL**: ${window.location.href.replace('/summary', '')}

**Participants**: ${participants}

**Posts**: ${session.posts.length}

**Votes**: ${numberOfVotes}

### Posts
`;

    columns.forEach(col => {
      md += `
  
#### ${col.label}

${col.posts.map(toPost).join('\n')}
`;
    });

    return md;
  }, [columns, state, translations.SessionName.defaultSessionName]);
  return result;
}

function toPost(post: Post): string {
  const positivesVotes = post.votes.filter(p => p.type === 'like').length;
  const negativeVotes = post.votes.filter(p => p.type === 'dislike').length;
  let content = `- (+${positivesVotes}/-${negativeVotes}) ${post.content}`;
  if (post.action) {
    content += `\n  - Action: ${post.action}`;
  }
  return content;
}
