import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TranslationFunction } from 'state/types';
import { cn } from 'ui/cn';
import { Tooltip } from 'ui/tooltip';
import { Palette } from '../../../../Theme';
import type { VoteAllowance } from './useRemainingVotes';

interface RemainingVotesProps {
  up: VoteAllowance | null;
  down: VoteAllowance | null;
}

const RemainingVotes = ({ up, down }: RemainingVotesProps) => {
  const { t } = useTranslation();
  if (up === null && down === null) {
    return <div />;
  }

  return (
    <div className="flex justify-end gap-5 pb-2.5 sm:pb-0">
      {up !== null ? (
        <Tooltip content={getTooltip(t, up, 'up')} side="bottom">
          <span className="relative inline-flex">
            <ThumbsUp className="size-6" style={{ color: Palette.positive }} />
            {up === 'unlimited' ? null : <Count value={up} />}
          </span>
        </Tooltip>
      ) : null}
      {down !== null ? (
        <Tooltip content={getTooltip(t, down, 'down')} side="bottom">
          <span className="relative inline-flex">
            <ThumbsDown
              className="size-6"
              style={{ color: Palette.negative }}
            />
            {down === 'unlimited' ? null : <Count value={down} />}
          </span>
        </Tooltip>
      ) : null}
    </div>
  );
};

function Count({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white',
        value > 0 ? 'bg-primary-700' : 'bg-red-600',
      )}
    >
      {value}
    </span>
  );
}

function getTooltip(
  t: TranslationFunction,
  value: VoteAllowance,
  type: 'up' | 'down',
) {
  const voteType = type === 'up' ? t('Post.upVote') : t('Post.downVote');
  if (value === 'unlimited') {
    return t('Post.voteRemainingUnlimited', { type: voteType });
  }
  if (value === 0) {
    return t('Post.voteRemainingNone', { type: voteType });
  }
  if (value === 1) {
    return t('Post.voteRemainingOne', { type: voteType });
  }
  return t('Post.voteRemainingMultiple', {
    number: value,
    type: voteType,
  });
}

export default RemainingVotes;
