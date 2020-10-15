import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { User } from 'retro-board-common';
import Wrapper from './Wrapper';
import Input from '../../components/Input';
import { Person, Email, VpnKey } from '@material-ui/icons';
import { accountLogin, updateLanguage } from '../../api';
import styled from 'styled-components';

interface AccountAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AccountAuth = ({ onClose, onUser }: AccountAuthProps) => {
  const { Login: loginTranslations } = useTranslations();
  const language = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMode, setLoginMode] = useState(true);
  const handleAccountogin = useCallback(() => {
    async function login() {
      if (
        registerName.length &&
        registerEmail.length &&
        registerPassword.length
      ) {
        await accountLogin(registerName, registerEmail, registerPassword);
        const updatedUser = await updateLanguage(language.value);
        onUser(updatedUser);
        if (onClose) {
          onClose();
        }
      }
    }
    login();
  }, [
    registerEmail,
    registerName,
    registerPassword,
    language.value,
    onClose,
    onUser,
  ]);

  return (
    <Wrapper
      header="Account"
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
      <Parts>
        <LoginPart>
          <Subtitle>Login</Subtitle>
          <Input
            value={loginEmail}
            onChangeValue={setLoginEmail}
            title="email"
            placeholder="email"
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
        </LoginPart>
        <RegisterPart>
          <Subtitle>Register</Subtitle>
          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={loginTranslations.buttonLabel}
            placeholder={loginTranslations.namePlaceholder}
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Person />}
          />
          <Input
            value={registerEmail}
            onChangeValue={setRegisterEmail}
            title="email"
            placeholder="email"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Email />}
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
          />
        </RegisterPart>
      </Parts>
    </Wrapper>
  );
};

const Subtitle = styled.div`
  font-weight: 100;
  font-size: 1.3em;
  margin-top: 20px;
`;

const LoginPart = styled.div`
  flex: 1;
`;

const RegisterPart = styled.div`
  flex: 1;
`;

const Parts = styled.div`
  display: flex;
  > div:first-child {
    margin-right: 10px;
  }
  > div:last-child {
    margin-left: 10px;
  }
  @media screen and (max-width: 600px) {
    flex-direction: column;
    > div:first-child {
      margin-right: 0px;
      margin-bottom: 20px;
    }
    > div:last-child {
      margin-left: 0px;
    }
  }
`;

export default AccountAuth;
