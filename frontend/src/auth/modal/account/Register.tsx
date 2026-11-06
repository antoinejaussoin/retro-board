import { Suspense, useCallback, useState, useMemo, lazy } from 'react';
import Button from '@mui/material/Button';
import { Alert } from '@mui/material';
import { useLanguage } from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Person, Email, VpnKey } from '@mui/icons-material';
import { me, register, updateLanguage } from '../../../api';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { useTranslation } from 'react-i18next';
import { validate } from 'email/validate';
import { trackEvent } from 'track';
import { useSetUser } from 'state/user/useSetUser';

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
    return validate(registerEmail);
  }, [registerEmail]);

  const validName = registerName.length > 0;

  const handleRegistration = useCallback(async () => {
    const response = await register(
      registerName,
      registerEmail,
      registerPassword,
      language.locale
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
            onClick={onCancel}
            color="secondary"
            data-cy="cancel-register-button"
          >
            {t('Generic.cancel')}
          </Button>
          {!isSuccessful ? (
            <Button
              onClick={handleRegistration}
              color="primary"
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
        <>
          <Alert severity="info">{t('Register.info')}</Alert>

          {generalError ? (
            <Alert severity="error" style={{ marginTop: 10 }}>
              {generalError}
            </Alert>
          ) : null}

          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={t('AuthCommon.nameField')!}
            placeholder={t('AuthCommon.nameField')!}
            variant="standard"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Person />}
            required
            data-cy="register-name"
          />
          <Input
            value={registerEmail}
            onChangeValue={setRegisterEmail}
            title={t('AuthCommon.emailField')!}
            placeholder={t('AuthCommon.emailField')!}
            variant="standard"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Email />}
            required
            error={!validEmail && registerEmail.length > 0}
            helperText={
              !validEmail && registerEmail.length > 0
                ? t('Register.errorInvalidEmail')
                : undefined
            }
            data-cy="register-email"
          />
          <Input
            value={registerPassword}
            onChangeValue={setRegisterPassword}
            title={t('AuthCommon.passwordField')!}
            placeholder={t('AuthCommon.passwordField')!}
            variant="standard"
            type="password"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<VpnKey />}
            required
            data-cy="register-password"
          />
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
        </>
      )}
    </Wrapper>
  );
};

export default Register;
