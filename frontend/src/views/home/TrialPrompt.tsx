import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import useIsTrial from '../../auth/useIsTrial';
import useUser from '../../state/user/useUser';
import useFormatDate from '../../hooks/useFormatDate';
import { useTranslation } from 'react-i18next';
import useQuota from '../../hooks/useQuota';
import ProButton from '../../components/ProButton';
import { Alert, type AlertSeverity } from 'ui/alert';
import { Button } from 'ui/button';

export default function TrialPrompt() {
  const user = useUser();
  const isInTrial = useIsTrial();
  const formatDistanceToNow = useFormatDate();
  const { t } = useTranslation();
  const { quota } = useQuota();
  const quotaLeft = quota ? quota.quota - quota.posts : null;
  const overQuota = !!quota && quota.posts >= quota.quota;
  const nearQuota = !!quota && !overQuota && quota.posts >= quota.quota - 20;

  if (!user || user.pro) {
    return null;
  }

  if (user.trial && isInTrial) {
    const remainingDays = differenceInDays(new Date(user.trial), new Date());
    const color = getAlertType(remainingDays);

    return (
      <Alert severity={color} title={t('TrialPrompt.onTrialTitle')}>
        {t('TrialPrompt.remainingTrialSentence', {
          remaining: formatDistanceToNow(new Date(user.trial)),
        })}
        &nbsp;
        <Link className="font-medium no-underline" to="/subscribe">
          {t('TrialPrompt.subscribeNow')}
        </Link>
      </Alert>
    );
  }

  return (
    <>
      {user.trial && !isInTrial ? (
        <Alert severity="error" title={t('TrialPrompt.trialEndedTitle')}>
          {t('TrialPrompt.trialEndedSentence')}&nbsp;
          <Link className="font-medium no-underline" to="/subscribe">
            {t('TrialPrompt.subscribeNow')}
          </Link>
        </Alert>
      ) : null}
      {overQuota ? (
        <Alert severity="error" title={t('TrialPrompt.allowanceReachedTitle')}>
          {t('TrialPrompt.allowanceReachedDescription')}
          <ProButton>
            <Button size="sm" className="ml-2">
              {t('TrialPrompt.subscribeNow')}
            </Button>
          </ProButton>
        </Alert>
      ) : null}
      {nearQuota ? (
        <Alert
          severity="warning"
          title={t('TrialPrompt.nearEndAllowanceTitle')}
        >
          {t('TrialPrompt.nearEndAllowanceDescription', { quota: quotaLeft })}
          <ProButton>
            <Button size="sm" className="ml-2">
              {t('TrialPrompt.subscribeNow')}
            </Button>
          </ProButton>
        </Alert>
      ) : null}
    </>
  );
}

function getAlertType(remainingDays: number): AlertSeverity {
  if (remainingDays < 0) {
    return 'error';
  }
  if (remainingDays < 5) {
    return 'warning';
  }

  return 'info';
}
