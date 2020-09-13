import React from 'react';
import { VoteEnumeration } from '../utils';
import ActionButton from './ActionButton';

interface VoteButtonProps {
  voters: VoteEnumeration[];
  showTooltip: boolean;
  canVote: boolean;
  count: number;
  icon: JSX.Element;
  ariaLabel: string;
  onClick: () => void;
}

const VoteButton = ({
  voters,
  showTooltip,
  canVote,
  count,
  icon,
  onClick,
  ariaLabel,
}: VoteButtonProps) => {
  const show = showTooltip && voters.length;
  return (
    <ActionButton
      onClick={onClick}
      ariaLabel={ariaLabel}
      icon={icon}
      disabled={!canVote}
      tooltip={
        show ? (
          <div>
            {voters.map((voter, i) => (
              <p key={i}>
                {voter.name}
                {voter.count > 1 ? ` (x${voter.count})` : ''}
              </p>
            ))}
          </div>
        ) : (
          ''
        )
      }
    >
      {count}
    </ActionButton>
  );
};

export default VoteButton;
