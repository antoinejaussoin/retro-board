import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { anonymousLogin, me, updateLanguage } from '../../api';
import Input from '../../components/Input';
import type { FullUser } from 'common';
import { trackEvent } from 'track';
import { useLanguage } from 'translations';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import Wrapper from './Wrapper';

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
        trackEvent('register/anonymous');
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

  return (
    <Wrapper
      header={t('AnonymousLogin.anonymousAuthHeader')!}
      actions={
        <Button
          onClick={handleAnonLogin}
          autoFocus
          disabled={!username.trim().length}
          data-cy="anon-login-button"
        >
          {t('AnonymousLogin.buttonLabel')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert severity="info">
          {t('AnonymousLogin.anonymousAuthDescription')}
        </Alert>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Input
          value={username}
          onChangeValue={setUsername}
          placeholder={t('AnonymousLogin.namePlaceholder')!}
          fullWidth
          data-cy="anon-input"
        />
      </div>
    </Wrapper>
  );
};

export default AnonAuth;
