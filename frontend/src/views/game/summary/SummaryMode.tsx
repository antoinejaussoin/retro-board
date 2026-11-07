import { SquareCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../../../components/Page';
import useCrypto from '../../../crypto/useCrypto';
import { Palette } from '../../../Theme';
import { usePostUserPermissionsNullable } from '../board/usePostUserPermissions';
import { useSearch } from '../is-search-match';
import { ColumnContent } from '../types';
import { AiSummary } from './AiSummary';
import SpeedDial from './SpeedDial';
import { useSummary } from './useSummary';
import { ActionItem, ColumnStats, ColumnStatsItem } from './types';

interface SummaryModeProps {
  columns: ColumnContent[];
  search: string;
}

interface SectionProps {
  stats: ColumnStats;
  search: string;
}

function Section({ stats, search }: SectionProps) {
  const { t } = useTranslation();

  return (
    <section className="mb-4" role="list">
      <article className="overflow-hidden rounded-2xl border border-line bg-cream shadow-card">
        <header
          className="border-t-4 px-5 py-3 text-lg font-light"
          style={{ borderTopColor: stats.column.color }}
        >
          {stats.column.label}
        </header>
        <div className="px-5 py-4">
          {stats.items.length ? (
            <PostsList items={stats.items} search={search} />
          ) : (
            <p>{t('SummaryBoard.noPosts')}</p>
          )}
        </div>
      </article>
    </section>
  );
}

interface GroupSummaryProps {
  group: ColumnStatsItem;
  search: string;
}

function GroupSummary({ group, search }: GroupSummaryProps) {
  const { decrypt } = useCrypto();
  return (
    <div className="my-2 border-l border-dashed border-gray-400 pl-3">
      <div className="flex items-center gap-2 font-semibold opacity-60">
        <Score
          likes={group.likes}
          dislikes={group.dislikes}
          reactions={group.reactions}
        />
        <span>{decrypt(group.content)}</span>
      </div>
      <div className="mt-1 ml-4">
        <PostsList items={group.children} search={search} />
      </div>
    </div>
  );
}

interface PostsListProps {
  items: ColumnStatsItem[];
  search: string;
}

function PostsList({ items, search }: PostsListProps) {
  const searchPredicate = useSearch(search);
  return (
    <div>
      {items
        .filter((item) => (item.post ? searchPredicate(item.post) : true))
        .map((item) =>
          item.type === 'post' ? (
            <PostLine item={item} key={item.id} />
          ) : (
            <GroupSummary group={item} key={item.id} search={search} />
          ),
        )}
    </div>
  );
}

interface PostLineProps {
  item: ColumnStatsItem;
}

function PostLine({ item }: PostLineProps) {
  const { decrypt } = useCrypto();
  const permissions = usePostUserPermissionsNullable(item.post);
  const canShowAuthor = permissions && permissions.canShowAuthor;
  return (
    <div className="rounded-lg px-1 hover:bg-paper" role="listitem">
      <div className="flex gap-2 py-1.5">
        <Score
          likes={item.likes}
          dislikes={item.dislikes}
          reactions={item.reactions}
        />
        <span className="flex-1 whitespace-pre-wrap" aria-label="post content">
          {decrypt(item.content)}
        </span>
        {canShowAuthor ? (
          <span className="flex items-center px-2 text-xs text-muted">
            (by {item.post?.user.name})
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Score({
  likes,
  dislikes,
  reactions,
}: {
  likes: number;
  dislikes: number;
  reactions: { emoji: string; count: number }[];
}) {
  return (
    <span className="shrink-0">
      <span style={{ color: Palette.positive }}>+{likes}</span>
      &nbsp;
      <span style={{ color: Palette.negative }}>-{dislikes}</span>
      {reactions.length ? (
        <>
          &nbsp;
          <span className="text-muted">
            {reactions
              .map((reaction) => `${reaction.emoji}${reaction.count}`)
              .join(' ')}
          </span>
        </>
      ) : null}
    </span>
  );
}

interface ActionsListProps {
  actions: ActionItem[];
}

function ActionsList({ actions }: ActionsListProps) {
  const { t } = useTranslation();
  const { decrypt } = useCrypto();
  return (
    <section className="mt-5" role="list">
      <article className="overflow-hidden rounded-2xl border border-line border-t-4 border-t-primary-700 bg-cream shadow-card">
        <header className="px-5 py-3 text-lg font-light">
          {t('Actions.summaryTitle')}
        </header>
        <ul className="px-5 py-2">
          {actions.map((action) => (
            <li key={action.postId} className="flex gap-3 py-2" role="listitem">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800">
                <SquareCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p>{decrypt(action.action)}</p>
                <p className="text-sm text-muted">{decrypt(action.postContent)}</p>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export function SummaryMode({ columns, search }: SummaryModeProps) {
  const stats = useSummary(columns);
  const [aiSummary, setAiSummary] = useState('');
  const { t } = useTranslation();
  return (
    <Page className="pb-36">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-light tracking-tight">
          {t('GameMenu.summary')}
        </h1>
        <SpeedDial summary={aiSummary} />
      </div>
      <AiSummary onSummary={setAiSummary} />
      {stats.columns.map((stat) => (
        <Section key={stat.column.index} stats={stat} search={search} />
      ))}
      {stats.actions.length ? <ActionsList actions={stats.actions} /> : null}
    </Page>
  );
}
