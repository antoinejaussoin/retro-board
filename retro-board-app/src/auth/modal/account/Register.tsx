import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../../translations';
import { User } from 'retro-board-common';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import Link from '../../../components/Link';
import { Person, Email, VpnKey } from '@material-ui/icons';
import { accountLogin, updateLanguage } from '../../../api';
import styled from 'styled-components';

interface RegisterProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const Register = ({ onClose, onUser }: RegisterProps) => {
  const { Login: loginTranslations } = useTranslations();
  const language = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleRegistration = useCallback(() => {}, []);

  return (
    <Wrapper
      header="Register"
      actions={
        <Button
          onClick={handleRegistration}
          color="primary"
          autoFocus
          disabled={false}
        >
          Register
        </Button>
      }
    >
      <Alert severity="info">Todo</Alert>

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
    </Wrapper>
  );
};

export default Register;
