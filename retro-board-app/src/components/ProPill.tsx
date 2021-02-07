import { Chip, colors } from '@material-ui/core';
import { Star } from '@material-ui/icons';
import useIsPro from '../auth/useIsPro';
import useIsTrial from '../auth/useIsTrial';

interface ProPillProps {
  small?: boolean;
}

function ProPill({ small = false }: ProPillProps) {
  const isPro = useIsPro();
  const isTrial = useIsTrial();
  if (!isPro) {
    return null;
  }
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
      label={isTrial ? `Pro Trial` : 'Pro'}
      color="secondary"
      size={small ? 'small' : 'medium'}
    />
  );
}

export default ProPill;
