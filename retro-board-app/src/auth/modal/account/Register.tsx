import React, { Suspense, useCallback, useState, useMemo } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Person, Email, VpnKey } from '@material-ui/icons';
import { accountLogin, updateLanguage, register } from '../../../api';
import { validate } from 'isemail';

const PasswordStrength = React.lazy(
  () => import('react-password-strength-bar')
);

const scoreWords = ['weak', 'weak', 'not quite', 'good', 'strong'];

const Register = () => {
  const { Login: loginTranslations } = useTranslations();
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
          setGeneralError('This email is already registered');
          return;
        default:
          setGeneralError(
            'An error occurred while trying to create your account.'
          );
          return;
      }
    } else {
      await updateLanguage(language.value);
      setIsSuccessful(true);
    }
  }, [registerName, registerEmail, registerPassword, language.value]);

  return (
    <Wrapper
      header="Register"
      actions={
        !isSuccessful ? (
          <Button
            onClick={handleRegistration}
            color="primary"
            autoFocus
            disabled={!validEmail || passwordScore < 3 || !validName}
          >
            Register
          </Button>
        ) : undefined
      }
    >
      {isSuccessful ? (
        <Alert severity="success">
          Thank you! You should receive an email shortly to validate your
          account.
        </Alert>
      ) : (
        <>
          <Alert severity="info">Todo</Alert>

          {!!generalError ? (
            <Alert severity="error" style={{ marginTop: 10 }}>
              {generalError}
            </Alert>
          ) : null}

          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={loginTranslations.buttonLabel}
            placeholder={loginTranslations.namePlaceholder}
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Person />}
            required
          />
          <Input
            value={registerEmail}
            onChangeValue={setRegisterEmail}
            title="email"
            placeholder="email"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Email />}
            required
            error={!validEmail && registerEmail.length > 0}
            helperText={
              !validEmail && registerEmail.length > 0
                ? 'Please enter a valid email'
                : undefined
            }
          />
          <Input
            value={registerPassword}
            onChangeValue={setRegisterPassword}
            title="Password"
            placeholder="Password"
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
              scoreWords={scoreWords}
            />
          </Suspense>
        </>
      )}
    </Wrapper>
  );
};

export default Register;
