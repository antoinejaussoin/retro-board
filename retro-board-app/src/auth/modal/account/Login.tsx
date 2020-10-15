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
  const { Login: loginTranslations } = useTranslations();
  const language = useLanguage();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const handleAccountogin = useCallback(() => {
    async function login() {
      if (loginEmail.length && loginPassword.length) {
        await accountLogin(loginEmail, loginPassword);
        const updatedUser = await updateLanguage(language.value);
        onUser(updatedUser);
        if (onClose) {
          onClose();
        }
      }
    }
    login();
  }, [loginEmail, loginPassword, language.value, onClose, onUser]);

  return (
    <Wrapper
      header="Login"
      actions={
        <Button
          onClick={handleAccountogin}
          color="primary"
          autoFocus
          disabled={false}
        >
          {loginTranslations.buttonLabel}
        </Button>
      }
    >
      <Alert severity="info">Todo</Alert>
      <Input
        value={loginEmail}
        onChangeValue={setLoginEmail}
        title="email"
        placeholder="email"
        type="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
      <Input
        value={loginPassword}
        onChangeValue={setLoginPassword}
        title="Password"
        placeholder="Password"
        type="password"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<VpnKey />}
      />
      <div style={{ marginTop: 20 }} />
      <Link onClick={onAskRegistration}>No account? register here.</Link>
      or perhaps you{' '}
      <Link onClick={onAskPasswordReset}>forgot your password?</Link>
    </Wrapper>
  );
};

export default Login;
