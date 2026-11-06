import { Mail } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../../api';
import Input from '../../../components/Input';
import useBackendCapabilities from '../../../global/useBackendCapabilities';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import Wrapper from './../Wrapper';

type LostPasswordProps = {
  onCancel: () => void;
};

const LostPassword = ({ onCancel }: LostPasswordProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const backend = useBackendCapabilities();
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

  if (!backend.emailAvailable && backend.selfHosted) {
    return (
      <Alert severity="info">
        You are using a Self-Hosted version of Retrospected, without email
        support. In order to reset your password, ask your admin (
        {backend.adminEmail}) to access the admin page to do that:&nbsp;
        <Link to="/admin" className="underline">
          Admin Panel
        </Link>
      </Alert>
    );
  }

  return done ? (
    <Alert severity="success">{t('ResetPassword.doneMessage')}</Alert>
  ) : (
    <Wrapper
      header={t('ResetPassword.header')!}
      actions={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            data-cy="cancel-register-button"
          >
            {t('Generic.cancel')}
          </Button>
          <Button
            onClick={handleForgotPassword}
            autoFocus
            disabled={!email.length}
          >
            {t('ResetPassword.resetButton')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert severity="info">{t('ResetPassword.info')}</Alert>
        <Input
          value={email}
          onChangeValue={setEmail}
          title={t('AuthCommon.emailField')!}
          placeholder={t('AuthCommon.emailField')!}
          type="email"
          fullWidth
          leftIcon={<Mail className="size-4" />}
        />
      </div>
    </Wrapper>
  );
};

export default LostPassword;
