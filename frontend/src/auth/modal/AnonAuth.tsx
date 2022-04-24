import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import { Alert } from '@mui/material';
import useTranslations, { useLanguage } from '../../translations';
import { anonymousLogin, updateLanguage } from '../../api';
import { FullUser } from 'common';
import Wrapper from './Wrapper';

interface AnonAuthProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
}

const AnonAuth = ({ onClose, onUser }: AnonAuthProps) => {
  const { AnonymousLogin: loginTranslations } = useTranslations();
  const language = useLanguage();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleAnonLogin = useCallback(() => {
    async function login() {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length) {
        const user = await anonymousLogin(trimmedUsername);
        if (!user) {
          setError('Your anonymous account is not valid.');
          return;
        }
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
          data-cy="anon-login-button"
        >
          {loginTranslations.buttonLabel}
        </Button>
      }
    >
      <Alert severity="info">
        {loginTranslations.anonymousAuthDescription}
      </Alert>
      {!!error ? (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {error}
        </Alert>
      ) : null}
      <Input
        value={username}
        onChange={handleUsernameChange}
        title={loginTranslations.buttonLabel}
        placeholder={loginTranslations.namePlaceholder}
        fullWidth
        style={{ marginTop: 20 }}
        inputProps={{ 'data-cy': 'anon-input' }}
      />
    </Wrapper>
  );
};

export default AnonAuth;
