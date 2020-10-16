import React, { Suspense, useCallback, useState, useMemo } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Person, Email, VpnKey } from '@material-ui/icons';
import { updateLanguage, register } from '../../../api';
import { validate } from 'isemail';

const PasswordStrength = React.lazy(
  () => import('react-password-strength-bar')
);

const Register = () => {
  const {
    Register: translations,
    AuthCommon: authTranslations,
  } = useTranslations();
  const language = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const validEmail = useMemo(() => {
    return validate(registerEmail);
  }, [registerEmail]);

  const validName = registerName.length > 3;

  const handleRegistration = useCallback(async () => {
    const response = await register(
      registerName,
      registerEmail,
      registerPassword
    );
    if (response.error) {
      switch (response.error) {
        case 'already-exists':
          setGeneralError(translations.errorAlreadyRegistered!);
          return;
        default:
          setGeneralError(translations.errorGeneral!);
          return;
      }
    } else {
      await updateLanguage(language.value);
      setIsSuccessful(true);
    }
  }, [
    registerName,
    registerEmail,
    registerPassword,
    language.value,
    translations,
  ]);

  return (
    <Wrapper
      header={translations.header}
      actions={
        !isSuccessful ? (
          <Button
            onClick={handleRegistration}
            color="primary"
            autoFocus
            disabled={!validEmail || passwordScore < 3 || !validName}
          >
            {translations.registerButton}
          </Button>
        ) : undefined
      }
    >
      {isSuccessful ? (
        <Alert severity="success">{translations.messageSuccess}</Alert>
      ) : (
        <>
          <Alert severity="info">{translations.info}</Alert>

          {!!generalError ? (
            <Alert severity="error" style={{ marginTop: 10 }}>
              {generalError}
            </Alert>
          ) : null}

          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={authTranslations.nameField}
            placeholder={authTranslations.nameField}
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Person />}
            required
          />
          <Input
            value={registerEmail}
            onChangeValue={setRegisterEmail}
            title={authTranslations.emailField}
            placeholder={authTranslations.emailField}
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Email />}
            required
            error={!validEmail && registerEmail.length > 0}
            helperText={
              !validEmail && registerEmail.length > 0
                ? translations.errorInvalidEmail
                : undefined
            }
          />
          <Input
            value={registerPassword}
            onChangeValue={setRegisterPassword}
            title={authTranslations.passwordField}
            placeholder={authTranslations.passwordField}
            type="password"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<VpnKey />}
            required
          />
          <Suspense fallback={<span />}>
            <PasswordStrength
              onChangeScore={setPasswordScore}
              password={registerPassword}
              shortScoreWord={authTranslations.passwordScoreWords![0]}
              scoreWords={authTranslations.passwordScoreWords}
            />
          </Suspense>
        </>
      )}
    </Wrapper>
  );
};

export default Register;
