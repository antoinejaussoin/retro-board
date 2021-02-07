import { Alert, AlertTitle, Color } from '@material-ui/lab';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import useUser from '../../auth/useUser';

export default function TrialPrompt() {
  const user = useUser();

  if (!user || !user?.trial) {
    return null;
  }

  if (!!user.trial) {
    const remainingDays = differenceInDays(new Date(user.trial), new Date());
    const color = getAlertType(remainingDays);

    return (
      <Alert severity={color}>
        <AlertTitle>You are on a trial subscription.</AlertTitle>
        You have {formatDistanceToNow(new Date(user.trial))} left on your
        trial.&nbsp;
        <Link style={{ textDecoration: 'none' }} to="/subscribe">
          Subscribe now!
        </Link>
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        <AlertTitle>Your trial has ended</AlertTitle>
        Subscribe now to continue to have access to the pro features.
      </Alert>
    );
  }
}

function getAlertType(remainingDays: number): Color {
  if (remainingDays < 0) {
    return 'error';
  }
  if (remainingDays < 5) {
    return 'warning';
  }

  return 'info';
}
