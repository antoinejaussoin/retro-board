import Chip from '@mui/material/Chip';
import { colors } from '@mui/material';
import { Star } from '@mui/icons-material';
import useIsPro from '../auth/useIsPro';
import useIsTrial from '../auth/useIsTrial';
import useUser from '../auth/useUser';

interface ProPillProps {
  small?: boolean;
}

function ProPill({ small = false }: ProPillProps) {
  const isPro = useIsPro();
  const isTrial = useIsTrial();
  const user = useUser();
  if (!user) {
    return null;
  }
  if (!isPro) {
    return (
      <Chip
        label={'Free'}
        color="primary"
        style={{ backgroundColor: colors.grey[500] }}
        size={small ? 'small' : 'medium'}
      />
    );
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
