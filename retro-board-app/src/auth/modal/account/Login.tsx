import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../../translations';
import { User } from 'retro-board-common';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import Link from '../../../components/Link';
import { Email, VpnKey } from '@material-ui/icons';
import { accountLogin, updateLanguage } from '../../../api';
import styled from 'styled-components';

interface LoginProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
  onAskRegistration: () => void;
  onAskPasswordReset: () => void;
}

const Login = ({
  onClose,
  onUser,
  onAskRegistration,
  onAskPasswordReset,
}: LoginProps) => {
  const {
    AccountLogin: translations,
    AuthCommon: authTranslations,
  } = useTranslations();
  const language = useLanguage();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const handleAccountogin = useCallback(() => {
    async function login() {
      if (loginEmail.length && loginPassword.length) {
        await accountLogin(loginEmail, loginPassword);
        const updatedUser = await updateLanguage(language.value);
        onUser(updatedUser);
        if (updatedUser) {
          if (onClose) {
            onClose();
          }
        } else {
          setError(translations.errorEmailPasswordIncorrect!);
        }
      }
    }
    login();
  }, [
    loginEmail,
    loginPassword,
    language.value,
    translations,
    onClose,
    onUser,
  ]);

  return (
    <Wrapper
      header={translations.header}
      actions={
        <Button
          onClick={handleAccountogin}
          color="primary"
          autoFocus
          disabled={!loginEmail || !loginPassword}
        >
          {translations.loginButton}
        </Button>
      }
    >
      <Alert severity="info">{translations.info}</Alert>
      {!!error ? (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {error}
        </Alert>
      ) : null}
      <Input
        value={loginEmail}
        onChangeValue={setLoginEmail}
        title={authTranslations.emailField}
        placeholder={authTranslations.emailField}
        type="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
      <Input
        value={loginPassword}
        onChangeValue={setLoginPassword}
        title={authTranslations.passwordField}
        placeholder={authTranslations.passwordField}
        type="password"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<VpnKey />}
      />
      <div style={{ marginTop: 20 }} />
      <Links>
        <Link onClick={onAskRegistration}>{translations.registerLink}</Link>
        <Link onClick={onAskPasswordReset}>
          {translations.forgotPasswordLink}
        </Link>
      </Links>
    </Wrapper>
  );
};

const Links = styled.div`
  display: flex;
  > :first-child {
    margin-right: 20px;
  }

  @media (max-width: 400px) {
    flex-direction: column;
    > :first-child {
      margin-right: 0px;
      margin-bottom: 5px;
    }
  }
`;

export default Login;
