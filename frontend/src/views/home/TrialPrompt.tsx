import { Alert, AlertColor, AlertTitle } from '@mui/material';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import useUser from '../../auth/useUser';
import useFormatDate from '../../hooks/useFormatDate';
import useTranslations from '../../translations';
import useQuota from '../../hooks/useQuota';
import Button from '@mui/material/Button';
import ProButton from '../../components/ProButton';

export default function TrialPrompt() {
  const user = useUser();
  const isInTrial = useIsTrial();
  const formatDistanceToNow = useFormatDate();
  const { TrialPrompt: translations } = useTranslations();
  const { quota } = useQuota();
  const quotaLeft = !!quota ? quota.quota - quota.posts : null;
  const overQuota = !!quota && quota.posts >= quota.quota;
  const nearQuota = !!quota && !overQuota && quota.posts >= quota.quota - 20;

  if (!user || user.pro) {
    return null;
  }

  if (user.trial && isInTrial) {
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
  }

  return (
    <>
      {user.trial && !isInTrial ? (
        <Alert severity="error">
          <AlertTitle>{translations.trialEndedTitle}</AlertTitle>
          {translations.trialEndedSentence}&nbsp;
          <Link style={{ textDecoration: 'none' }} to="/subscribe">
            {translations.subscribeNow}
          </Link>
        </Alert>
      ) : null}
      {overQuota ? (
        <Alert severity="error">
          <AlertTitle>{translations.allowanceReachedTitle}</AlertTitle>
          {translations.allowanceReachedDescription}
          <ProButton>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginLeft: 10 }}
            >
              {translations.subscribeNow}
            </Button>
          </ProButton>
        </Alert>
      ) : null}
      {nearQuota ? (
        <Alert severity="warning">
          <AlertTitle>{translations.nearEndAllowanceTitle}</AlertTitle>
          {translations.nearEndAllowanceDescription!(quotaLeft)}
          <ProButton>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginLeft: 10 }}
            >
              {translations.subscribeNow}
            </Button>
          </ProButton>
        </Alert>
      ) : null}
    </>
  );
}

function getAlertType(remainingDays: number): AlertColor {
  if (remainingDays < 0) {
    return 'error';
  }
  if (remainingDays < 5) {
    return 'warning';
  }

  return 'info';
}
