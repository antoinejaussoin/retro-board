import React, { useCallback } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { User } from 'retro-board-common';
import Wrapper from './Wrapper';

interface AccountAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AccountAuth = ({ onClose, onUser }: AccountAuthProps) => {
  const { Login: loginTranslations } = useTranslations();
  // const language = useLanguage();
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
    </Wrapper>
  );
};

export default AccountAuth;
