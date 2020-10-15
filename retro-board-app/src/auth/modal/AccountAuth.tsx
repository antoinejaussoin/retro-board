import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { User } from 'retro-board-common';
import Wrapper from './Wrapper';
import Input from '../../components/Input';
import { Person, Email, VpnKey } from '@material-ui/icons';

interface AccountAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AccountAuth = ({ onClose, onUser }: AccountAuthProps) => {
  const { Login: loginTranslations } = useTranslations();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleAccountogin = useCallback(() => {}, []);

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
      <Input
        value={name}
        onChangeValue={setName}
        title={loginTranslations.buttonLabel}
        placeholder={loginTranslations.namePlaceholder}
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Person />}
      />
      <Input
        value={email}
        onChangeValue={setEmail}
        title="email"
        placeholder="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
      <Input
        value={password}
        onChangeValue={setPassword}
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

export default AccountAuth;
