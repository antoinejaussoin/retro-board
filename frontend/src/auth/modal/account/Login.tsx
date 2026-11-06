import { KeyRound, Mail } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FullUser } from 'common';
import { accountLogin } from '../../../api';
import Input from '../../../components/Input';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { Spinner } from 'ui/spinner';
import Wrapper from './../Wrapper';

interface LoginProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
  onAskRegistration: () => void;
  onAskPasswordReset: () => void;
}

const Login = ({
  onClose,
  onUser,
  onAskRegistration,
  onAskPasswordReset,
}: LoginProps) => {
  const { t } = useTranslation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAccountogin = useCallback(() => {
    async function login() {
      if (loginEmail.length && loginPassword.length) {
        setLoading(true);
        const user = await accountLogin(loginEmail, loginPassword);
        setLoading(false);
        onUser(user);
        if (user) {
          if (onClose) {
            onClose();
          }
        } else {
          setError(t('AccountLogin.errorEmailPasswordIncorrect')!);
        }
      }
    }
    login();
  }, [loginEmail, loginPassword, t, onClose, onUser]);

  return (
    <Wrapper
      header={t('AccountLogin.header')!}
      help={t('AccountLogin.info')}
      actions={
        <Button
          onClick={handleAccountogin}
          autoFocus
          disabled={!loginEmail || !loginPassword || loading}
          data-cy="account-login-button"
        >
          {loading ? (
            <Spinner className="size-4 border-white/40 border-t-white" />
          ) : null}
          {t('AccountLogin.loginButton')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {error ? <Alert severity="error">{error}</Alert> : null}
        <div className="flex flex-wrap items-center gap-2 max-[400px]:flex-col max-[400px]:items-start">
          <Button
            variant="ghost"
            size="sm"
            data-cy="register"
            className="text-primary-700"
            onClick={onAskRegistration}
          >
            {t('AccountLogin.registerLink')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-cy="forgot-password"
            className="text-muted"
            onClick={onAskPasswordReset}
          >
            {t('AccountLogin.forgotPasswordLink')}
          </Button>
        </div>
        <Input
          value={loginEmail}
          onChangeValue={setLoginEmail}
          title={t('AuthCommon.emailField')!}
          placeholder={t('AuthCommon.emailField')!}
          type="email"
          fullWidth
          leftIcon={<Mail className="size-4" />}
          data-cy="account-login-input"
        />
        <Input
          value={loginPassword}
          onChangeValue={setLoginPassword}
          title={t('AuthCommon.passwordField')!}
          placeholder={t('AuthCommon.passwordField')!}
          type="password"
          fullWidth
          leftIcon={<KeyRound className="size-4" />}
          data-cy="account-password-input"
        />
      </div>
    </Wrapper>
  );
};

export default Login;
