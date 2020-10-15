import React, { useCallback, useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardActions,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { anonymousLogin, updateLanguage } from '../../api';
import { User } from 'retro-board-common';

interface AnonAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AnonAuth = ({ onClose, onUser }: AnonAuthProps) => {
  const { Login: loginTranslations } = useTranslations();
  const language = useLanguage();

  const [username, setUsername] = useState('');
  const handleAnonLogin = useCallback(() => {
    async function login() {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length) {
        await anonymousLogin(trimmedUsername);
        const updatedUser = await updateLanguage(language.value);
        onUser(updatedUser);
        if (onClose) {
          onClose();
        }
      }
    }
    login();
  }, [username, onUser, onClose, language]);
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [setUsername]
  );

  return (
    <Card>
      <CardHeader title={loginTranslations.anonymousAuthHeader} />
      <CardContent>
        <Alert severity="info">
          {loginTranslations.anonymousAuthDescription}
        </Alert>
        <Input
          value={username}
          onChange={handleUsernameChange}
          title={loginTranslations.buttonLabel}
          placeholder={loginTranslations.namePlaceholder}
          fullWidth
          style={{ marginTop: 20 }}
        />
        <CardActions style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={handleAnonLogin}
            color="primary"
            autoFocus
            disabled={!username.trim().length}
          >
            {loginTranslations.buttonLabel}
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default AnonAuth;
