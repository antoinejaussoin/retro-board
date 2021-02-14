import { useCallback, useState } from 'react';
import { Button, Input } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { anonymousLogin, updateLanguage } from '../../api';
import { FullUser } from '@retrospected/common';
import Wrapper from './Wrapper';

interface AnonAuthProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
}

const AnonAuth = ({ onClose, onUser }: AnonAuthProps) => {
  const { AnonymousLogin: loginTranslations } = useTranslations();
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
    <Wrapper
      header={loginTranslations.anonymousAuthHeader}
      actions={
        <Button
          onClick={handleAnonLogin}
          color="primary"
          autoFocus
          disabled={!username.trim().length}
        >
          {loginTranslations.buttonLabel}
        </Button>
      }
    >
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
    </Wrapper>
  );
};

export default AnonAuth;
