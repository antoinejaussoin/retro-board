import React, { useCallback, useState } from 'react';
import md5 from 'md5';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
  Input,
} from '@material-ui/core';
import useTranslations from '../translations';
import useGlobalState from '../state';

const Login = () => {
  const translations = useTranslations();
  const { login } = useGlobalState();
  const [username, setUsername] = useState('');
  const loginHandler = useCallback(() => {
    const id = md5(username);
    login(username, id);
  }, [login, username]);
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [setUsername]
  );
  const handleClose = useCallback(() => {}, []);
  return (
    <Dialog
      fullScreen={false}
      open={true}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">Login</DialogTitle>
      <DialogContent>
        <Input
          value={username}
          onChange={handleUsernameChange}
          title={translations.Login.buttonLabel}
          placeholder={translations.Login.namePlaceholder}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={loginHandler} color="primary" autoFocus>
          {translations.Login.buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Login;
