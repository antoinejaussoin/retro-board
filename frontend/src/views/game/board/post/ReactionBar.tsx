import type { ReactionExtract } from 'common';
import { SmilePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui/cn';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';
import { Tooltip } from 'ui/tooltip';
import { REACTION_EMOJIS } from '../../utils';

interface ReactionGroup {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  names: string[];
}

interface ReactionBarProps {
  reactions: ReactionExtract[];
  currentUserId: string | null;
  canReact: boolean;
  showNames: boolean;
  onToggle: (emoji: string) => void;
}

function groupReactions(
  reactions: ReactionExtract[],
  currentUserId: string | null,
): ReactionGroup[] {
  const byEmoji = new Map<string, ReactionGroup>();
  for (const reaction of reactions) {
    const existing = byEmoji.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.names.push(reaction.userName);
      if (currentUserId && reaction.userId === currentUserId) {
        existing.reactedByMe = true;
      }
    } else {
      byEmoji.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        reactedByMe: !!currentUserId && reaction.userId === currentUserId,
        names: [reaction.userName],
      });
    }
  }
  return REACTION_EMOJIS.map((emoji) => byEmoji.get(emoji)).filter(
    (group): group is ReactionGroup => !!group,
  );
}

const ReactionBar = ({
  reactions,
  currentUserId,
  canReact,
  showNames,
  onToggle,
}: ReactionBarProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const groups = useMemo(
    () => groupReactions(reactions, currentUserId),
    [reactions, currentUserId],
  );

  if (!canReact && groups.length === 0) {
    return null;
  }

  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
      {groups.map((group) => {
        const chip = (
          <button
            type="button"
            disabled={!canReact}
            onClick={() => onToggle(group.emoji)}
            aria-label={t('Post.reactionChip', {
              emoji: group.emoji,
              count: group.count,
            })}
            aria-pressed={group.reactedByMe}
            className={cn(
              'inline-flex h-7 items-center gap-0.5 rounded-full border px-1.5 text-xs transition-colors',
              group.reactedByMe
                ? 'border-primary-500 bg-primary-50 text-primary-800'
                : 'border-line bg-paper text-ink hover:bg-ink/5',
              !canReact && 'cursor-default opacity-80',
            )}
          >
            <span aria-hidden>{group.emoji}</span>
            <span>{group.count}</span>
          </button>
        );
        if (showNames && group.names.length) {
          return (
            <Tooltip
              key={group.emoji}
              content={
                <div>
                  {group.names.map((name, index) => (
                    <p key={`${group.emoji}-${name}-${index}`}>{name}</p>
                  ))}
                </div>
              }
            >
              {chip}
            </Tooltip>
          );
        }
        return <span key={group.emoji}>{chip}</span>;
      })}
      {canReact ? (
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip content={t('Post.addReaction')!} side="bottom">
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t('Post.addReaction')}
                className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-line text-muted hover:bg-ink/5 hover:text-ink"
              >
                <SmilePlus className="size-4" />
              </button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent align="start" className="w-auto p-2">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={t('Post.reactWith', { emoji })}
                  className="inline-flex size-9 items-center justify-center rounded-md text-xl hover:bg-ink/8"
                  onClick={() => {
                    onToggle(emoji);
                    setOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
};

export default ReactionBar;
