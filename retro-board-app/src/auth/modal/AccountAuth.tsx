import React, { useCallback } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { User } from 'retro-board-common';

interface AccountAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AccountAuth = ({ onClose, onUser }: AccountAuthProps) => {
  const { Login: loginTranslations } = useTranslations();
  // const language = useLanguage();
  const handleAccountogin = useCallback(() => {}, []);

  return (
    <Card>
      <CardHeader title={'account'} />
      <CardContent>
        <Alert severity="info">Todo</Alert>

        <CardActions style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={handleAccountogin}
            color="primary"
            autoFocus
            disabled={false}
          >
            {loginTranslations.buttonLabel}
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default AccountAuth;
