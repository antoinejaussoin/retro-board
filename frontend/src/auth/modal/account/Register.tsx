import { KeyRound, Mail, UserRound } from 'lucide-react';
import { Suspense, useCallback, useState, useMemo, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { me, register, updateLanguage } from '../../../api';
import Input from '../../../components/Input';
import { validate } from 'email/validate';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { useSetUser } from 'state/user/useSetUser';
import { trackEvent } from 'track';
import { useLanguage } from '../../../translations';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import Wrapper from './../Wrapper';

type RegisterProps = {
  onClose: () => void;
  onCancel: () => void;
};

const PasswordStrength = lazy(() => import('react-password-strength-bar'));

const Register = ({ onClose, onCancel }: RegisterProps) => {
  const { t } = useTranslation();
  const [language] = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const setUser = useSetUser();
  const { disablePasswordRegistration } = useBackendCapabilities();

  const validEmail = useMemo(() => {
    try {
      return validate(registerEmail);
    } catch {
      return false;
    }
  }, [registerEmail]);

  const validName = registerName.length > 0;
  const showEmailError = !validEmail && registerEmail.length > 0;

  const handleRegistration = useCallback(async () => {
    const response = await register(
      registerName,
      registerEmail,
      registerPassword,
      language.locale,
    );
    if (response.error) {
      switch (response.error) {
        case 'already-exists':
          setGeneralError(t('Register.errorAlreadyRegistered')!);
          return;
        default:
          setGeneralError(t('Register.errorGeneral')!);
          return;
      }
    } else {
      trackEvent('register/password');
      setIsSuccessful(true);
      if (response.loggedIn) {
        // Match anonymous login: read the session user back before updating
        // the cache. Setting the register payload directly leaves the suspense
        // user query pending, so the home page stays on its loading spinner.
        let currentUser = (await me()) ?? response.user;
        if (currentUser?.language == null) {
          currentUser = await updateLanguage(language.locale);
        }
        setUser(currentUser);
        onClose();
      }
    }
  }, [
    registerName,
    registerEmail,
    registerPassword,
    language.locale,
    t,
    setUser,
    onClose,
  ]);

  if (disablePasswordRegistration) {
    return (
      <Alert severity="error">
        Registration is disabled by your administrator. Ask your administrator
        to create an account for you.
      </Alert>
    );
  }

  return (
    <Wrapper
      header={t('Register.header')!}
      actions={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            data-cy="cancel-register-button"
          >
            {t('Generic.cancel')}
          </Button>
          {!isSuccessful ? (
            <Button
              onClick={handleRegistration}
              autoFocus
              disabled={!validEmail || passwordScore < 3 || !validName}
              data-cy="register-button"
            >
              {t('Register.registerButton')}
            </Button>
          ) : undefined}
        </>
      }
    >
      {isSuccessful ? (
        <Alert severity="success">{t('Register.messageSuccess')}</Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert severity="info">{t('Register.info')}</Alert>

          {generalError ? <Alert severity="error">{generalError}</Alert> : null}

          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={t('AuthCommon.nameField')!}
            placeholder={t('AuthCommon.nameField')!}
            fullWidth
            leftIcon={<UserRound className="size-4" />}
            required
            data-cy="register-name"
          />
          <div>
            <Input
              value={registerEmail}
              onChangeValue={setRegisterEmail}
              title={t('AuthCommon.emailField')!}
              placeholder={t('AuthCommon.emailField')!}
              type="email"
              fullWidth
              leftIcon={<Mail className="size-4" />}
              required
              aria-invalid={showEmailError}
              className={
                showEmailError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : undefined
              }
              data-cy="register-email"
            />
            {showEmailError ? (
              <p className="mt-1.5 text-sm text-red-700">
                {t('Register.errorInvalidEmail')}
              </p>
            ) : null}
          </div>
          <div>
            <Input
              value={registerPassword}
              onChangeValue={setRegisterPassword}
              title={t('AuthCommon.passwordField')!}
              placeholder={t('AuthCommon.passwordField')!}
              type="password"
              fullWidth
              leftIcon={<KeyRound className="size-4" />}
              required
              data-cy="register-password"
            />
            <div className="mt-2">
              <Suspense fallback={<span />}>
                <PasswordStrength
                  onChangeScore={setPasswordScore}
                  password={registerPassword}
                  shortScoreWord={
                    (
                      t(`AuthCommon.passwordScoreWords`, {
                        returnObjects: true,
                      }) as string[]
                    )[0]
                  }
                  scoreWords={
                    t('AuthCommon.passwordScoreWords', {
                      returnObjects: true,
                    }) as string[]
                  }
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Register;
