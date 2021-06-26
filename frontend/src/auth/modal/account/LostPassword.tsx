import { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Email } from '@material-ui/icons';
import { resetPassword } from '../../../api';
import { Link } from 'react-router-dom';
import useAdminEmail from '../../../global/useAdminEmail';
import useIsSelfHosted from '../../../global/useIsSelfHosted';

const LostPassword = () => {
  const { ResetPassword: translations, AuthCommon: authTranslations } =
    useTranslations();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const adminEmail = useAdminEmail();
  const isSelfHosted = useIsSelfHosted();
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

  if (isSelfHosted) {
    return (
      <Alert severity="info">
        You are using a Self-Hosted version of Retrospected. In order to reset
        your password, ask your admin ({adminEmail}) to access the admin page to
        do that:&nbsp;
        <Link to="/admin">Admin Panel</Link>
      </Alert>
    );
  }

  return done ? (
    <Alert severity="success">{translations.doneMessage}</Alert>
  ) : (
    <Wrapper
      header={translations.header}
      actions={
        <Button
          onClick={handleForgotPassword}
          color="primary"
          autoFocus
          disabled={!email.length}
        >
          {translations.resetButton}
        </Button>
      }
    >
      <Alert severity="info">{translations.info}</Alert>

      <Input
        value={email}
        onChangeValue={setEmail}
        title={authTranslations.emailField}
        placeholder={authTranslations.emailField}
        type="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
    </Wrapper>
  );
};

export default LostPassword;
