import { Alert, AlertTitle, Color } from '@material-ui/lab';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import useUser from '../../auth/useUser';
import useFormatDate from '../../hooks/useFormatDate';
import useTranslations from '../../translations';

export default function TrialPrompt() {
  const user = useUser();
  const isInTrial = useIsTrial();
  const { formatDistanceToNow } = useFormatDate();
  const { TrialPrompt: translations } = useTranslations();

  if (!user || user.pro || !user?.trial) {
    return null;
  }

  if (isInTrial) {
    const remainingDays = differenceInDays(new Date(user.trial), new Date());
    const color = getAlertType(remainingDays);

    return (
      <Alert severity={color}>
        <AlertTitle>{translations.onTrialTitle}</AlertTitle>
        {translations.remainingTrialSentence!(
          formatDistanceToNow(new Date(user.trial))
        )}
        &nbsp;
        <Link style={{ textDecoration: 'none' }} to="/subscribe">
          {translations.subscribeNow}
        </Link>
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        <AlertTitle>{translations.trialEndedTitle}</AlertTitle>
        {translations.trialEndedSentence}&nbsp;
        <Link style={{ textDecoration: 'none' }} to="/subscribe">
          {translations.subscribeNow}
        </Link>
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
