import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import { Alert } from '@mui/material';
import { anonymousLogin, me, updateLanguage } from '../../api';
import { FullUser } from 'common';
import Wrapper from './Wrapper';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'translations';

interface AnonAuthProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
}

const AnonAuth = ({ onClose, onUser }: AnonAuthProps) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [language] = useLanguage();

  const handleAnonLogin = useCallback(() => {
    async function login() {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length) {
        const user = await anonymousLogin(trimmedUsername);
        if (!user) {
          setError('Your anonymous account is not valid.');
          return;
        }
        let updatedUser = await me();
        if (updatedUser?.language === null) {
          updatedUser = await updateLanguage(language.locale);
        }
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
      header={t('AnonymousLogin.anonymousAuthHeader')}
      actions={
        <Button
          onClick={handleAnonLogin}
          color="primary"
          autoFocus
          disabled={!username.trim().length}
          data-cy="anon-login-button"
        >
          {t('AnonymousLogin.buttonLabel')}
        </Button>
      }
    >
      <Alert severity="info">
        {t('AnonymousLogin.anonymousAuthDescription')}
      </Alert>
      {!!error ? (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {error}
        </Alert>
      ) : null}
      <Input
        value={username}
        onChange={handleUsernameChange}
        title={t('AnonymousLogin.buttonLabel')}
        placeholder={t('AnonymousLogin.namePlaceholder')}
        fullWidth
        style={{ marginTop: 20 }}
        inputProps={{ 'data-cy': 'anon-input' }}
      />
    </Wrapper>
  );
};

export default AnonAuth;
