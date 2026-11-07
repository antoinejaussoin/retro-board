import ClosableAlert from 'components/ClosableAlert';
import useUser from 'state/user/useUser';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'ui/button';

export function SetupProPrompt() {
  const user = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAction = useCallback(() => {
    navigate('/account');
  }, [navigate]);

  const shouldDisplay =
    !!user?.pro &&
    user.plan === 'team' &&
    user.ownPlan &&
    user.planMembers?.length === 0;

  if (!shouldDisplay) {
    return null;
  }

  return (
    <ClosableAlert closable persisted id="setup-pro-prompt" severity="info">
      {t('Home.proNotSetupWarning')}&nbsp;
      <Button variant="ghost" size="sm" onClick={handleAction}>
        {t('Home.proNotSetupWarningAction')}
      </Button>
    </ClosableAlert>
  );
}
