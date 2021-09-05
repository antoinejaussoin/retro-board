import { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import { anonymousLogin, updateLanguage } from '../../api';
import { FullUser } from '@retrospected/common';
import Wrapper from './Wrapper';
import { loadCsrfToken } from '../../api/fetch';

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
        await loadCsrfToken(); // Because the user changed, so the CSRF token must be updated
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
      />
    </Wrapper>
  );
};

export default AnonAuth;
