import React from 'react';
import { Chip, colors } from '@material-ui/core';
import { Star } from '@material-ui/icons';

interface ProPillProps {
  small?: boolean;
  trial?: boolean;
}

function ProPill({ small = false, trial = false }: ProPillProps) {
  return (
    <Chip
      icon={
        <Star
          color="inherit"
          style={{
            color: colors.yellow[500],
            position: 'relative',
            top: -1,
            left: 1,
          }}
        />
      }
      label={trial ? `Pro Trial` : 'Pro'}
      color="secondary"
      size={small ? 'small' : 'medium'}
    />
  );
}

export default ProPill;
