import { reactionChipClassName } from './chipStyles';
import { VoteEnumeration } from '../../utils';
import { Tooltip } from 'ui/tooltip';

interface VoteButtonProps {
  voters: VoteEnumeration[];
  showTooltip: boolean;
  canVote: boolean;
  votedByMe: boolean;
  count: number;
  emoji: string;
  ariaLabel: string;
  onClick: () => void;
}

const VoteButton = ({
  voters,
  showTooltip,
  canVote,
  votedByMe,
  count,
  emoji,
  onClick,
  ariaLabel,
}: VoteButtonProps) => {
  const chip = (
    <button
      type="button"
      onClick={onClick}
      disabled={!canVote}
      aria-label={ariaLabel}
      aria-pressed={votedByMe}
      tabIndex={-1}
      className={reactionChipClassName({
        interactive: canVote,
      })}
    >
      <span aria-hidden>{emoji}</span>
      <span>{count}</span>
    </button>
  );

  if (showTooltip && voters.length) {
    return (
      <Tooltip
        content={
          <div>
            {voters.map((voter, i) => (
              <p key={i}>
                {voter.name}
                {voter.count > 1 ? ` (x${voter.count})` : ''}
              </p>
            ))}
          </div>
        }
        side="bottom"
      >
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

export default VoteButton;
