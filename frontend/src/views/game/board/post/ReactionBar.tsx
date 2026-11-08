import data from '@emoji-mart/data';
import type { ReactionExtract } from 'common';
import EmojiMartPicker from 'components/Icon/EmojiMartPicker';
import { initEmojiMart } from 'components/Icon/emoji-mart';
import { SmilePlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';
import { Tooltip } from 'ui/tooltip';
import { QUICK_REACTION_EMOJIS } from '../../utils';
import { reactionChipClassName } from './chipStyles';

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

type EmojiSelectPayload = {
  id: string;
  native?: string;
};

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
  const quick = QUICK_REACTION_EMOJIS.map((emoji) => byEmoji.get(emoji)).filter(
    (group): group is ReactionGroup => !!group,
  );
  const others = [...byEmoji.values()].filter(
    (group) =>
      !(QUICK_REACTION_EMOJIS as readonly string[]).includes(group.emoji),
  );
  return [...quick, ...others];
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

  useEffect(() => {
    void initEmojiMart();
  }, []);

  if (!canReact && groups.length === 0) {
    return null;
  }

  const pickEmoji = (emoji: string) => {
    onToggle(emoji);
    setOpen(false);
  };

  return (
    <>
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
            className={reactionChipClassName({
              interactive: canReact,
            })}
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
                className="retro-reaction-add inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink"
              >
                <SmilePlus className="size-4" />
              </button>
            </PopoverTrigger>
          </Tooltip>
          <PopoverContent align="start" className="z-[70] w-auto p-2">
            <div className="mb-2 flex gap-1 border-b border-line pb-2">
              {QUICK_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={t('Post.reactWith', { emoji })}
                  className="inline-flex size-9 items-center justify-center rounded-md text-xl hover:bg-ink/8"
                  onClick={() => pickEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <EmojiMartPicker
              data={data}
              theme="light"
              onEmojiSelect={(emoji: EmojiSelectPayload) => {
                const native = emoji.native?.trim();
                if (native) {
                  pickEmoji(native);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );
};

export default ReactionBar;
