import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Email } from '@material-ui/icons';
import { resetPassword } from '../../../api';

const LostPassword = () => {
  const { Login: loginTranslations } = useTranslations();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

  return done ? (
    <Alert severity="success">
      Done! Have a look in your emails, you should get a link to reset your
      password.
    </Alert>
  ) : (
    <Wrapper
      header="Forgot password"
      actions={
        <Button
          onClick={handleForgotPassword}
          color="primary"
          autoFocus
          disabled={!email.length}
        >
          Reset Password
        </Button>
      }
    >
      <Alert severity="info">Todo forgot password</Alert>

      <Input
        value={email}
        onChangeValue={setEmail}
        title="email"
        placeholder="email"
        type="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
    </Wrapper>
  );
};

export default LostPassword;
