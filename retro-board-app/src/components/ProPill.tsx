import Chip from '@material-ui/core/Chip';
import grey from '@material-ui/core/colors/grey';
import yellow from '@material-ui/core/colors/yellow';
import { Star } from '@material-ui/icons';
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
        style={{ backgroundColor: grey[500] }}
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
            color: yellow[500],
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
