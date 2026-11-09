import { UserRoundX } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { anonymousLogin, me, updateLanguage } from 'api';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';
import { useSetUser } from 'state/user/useSetUser';
import { trackEvent } from 'track';
import { useLanguage } from 'translations';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { cn } from 'ui/cn';
import AccountAuth from './AccountAuth';
import SocialAuth from './SocialAuth';

function OrDivider({
  label,
  responsive = false,
}: {
  label: string;
  responsive?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex h-px w-4/5 shrink-0 items-center justify-center bg-line',
        responsive &&
          '@min-[60rem]:h-auto @min-[60rem]:w-px @min-[60rem]:self-stretch',
      )}
    >
      <span className="relative -top-0.5 bg-cream px-2 text-sm text-muted">
        {label}
      </span>
    </div>
  );
}

interface LoginContentProps {
  anonymous: boolean;
  onClose: () => void;
}

export default function LoginContent({
  anonymous,
  onClose,
}: LoginContentProps) {
  const { any } = useOAuthAvailabilities();
  const { disableAnonymous, disablePasswords } = useBackendCapabilities();
  const hasNoSocialMediaAuth = !any;
  const hasNoWayOfLoggingIn =
    hasNoSocialMediaAuth && disableAnonymous && disablePasswords;
  const hasNoWayOtherThanAnonymous = hasNoSocialMediaAuth && disablePasswords;
  const { t } = useTranslation();
  const setUser = useSetUser();
  const [language] = useLanguage();

  const handleAnonLogin = useCallback(async () => {
    const user = await anonymousLogin('Anonymous User');
    if (!user) {
      return;
    }
    trackEvent('register/anonymous');
    let updatedUser = await me();
    if (updatedUser?.language === null) {
      updatedUser = await updateLanguage(language.locale);
    }
    setUser(updatedUser);
    if (onClose) {
      onClose();
    }
  }, [setUser, onClose, language]);

  if (hasNoWayOfLoggingIn) {
    // Falls through. This case also sets hasNoWayOtherThanAnonymous, so the
    // warning below is what renders.
  }

  const showSocial = !hasNoSocialMediaAuth;
  const showPasswords = !disablePasswords;

  const showAnonymous = anonymous && !hasNoWayOtherThanAnonymous;

  return (
    <div className="flex min-h-0 flex-1 flex-col text-ink">
      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto px-6 pt-5',
          showAnonymous ? 'pb-0' : 'pb-5',
        )}
      >
        {hasNoWayOtherThanAnonymous ? (
          <Alert severity="error">{t('AuthCommon.noAuthWarning')}</Alert>
        ) : (
          <div className="@container">
            <div
              className={
                showSocial && showPasswords
                  ? 'mx-auto w-full max-w-md @min-[60rem]:max-w-[60rem]'
                  : 'mx-auto w-full max-w-md'
              }
            >
              <div className="flex flex-col items-center gap-6 @min-[60rem]:flex-row @min-[60rem]:items-stretch @min-[60rem]:justify-center">
                {showSocial ? (
                  <div className="w-full min-w-0 max-w-md">
                    <SocialAuth onClose={onClose} onUser={setUser} />
                  </div>
                ) : null}
                {showSocial && showPasswords ? (
                  <OrDivider label={t('AuthCommon.or')} responsive />
                ) : null}
                {showPasswords ? (
                  <div className="w-full min-w-0 max-w-md">
                    <AccountAuth onClose={onClose} onUser={setUser} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
      {showAnonymous ? (
        <div className="flex shrink-0 flex-col items-center px-6 pt-6 pb-5">
          <div className="flex w-full max-w-md flex-col items-center gap-6">
            <OrDivider label={t('AuthCommon.or')} />
            <Button
              variant="outline"
              size="lg"
              onClick={handleAnonLogin}
              data-cy="login-anonymous"
              className="w-full"
            >
              <UserRoundX className="size-5" />
              {t('AuthCommon.skipAndAnonLogin')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
