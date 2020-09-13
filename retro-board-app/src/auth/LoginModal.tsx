import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useContext,
} from 'react';
import { User } from 'retro-board-common';
import io from 'socket.io-client';
import {
  Dialog,
  Button,
  DialogContent,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  GithubLoginButton,
  GoogleLoginButton,
  TwitterLoginButton,
} from 'react-social-login-buttons';
import useTranslations from '../translations';
import UserContext from './Context';
import { anonymousLogin } from '../api';
import styled from 'styled-components';
import config from '../utils/getConfig';

const API_URL = '/api/auth';

interface LoginModalProps {
  onClose?: () => void;
}

const Login = ({ onClose }: LoginModalProps) => {
  const { Login: loginTranslations } = useTranslations();
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const windowRef = useRef<Window | null>(null);
  const { setUser } = useContext(UserContext);
  const hasNoSocialMediaAuth =
    !config.GoogleAuthEnabled &&
    !config.TwitterAuthEnabled &&
    !config.GitHubAuthEnabled;

  useEffect(() => {
    const s = io();
    setSocket(s);
    s.on('auth', (user: User) => {
      setUser(user);
      if (windowRef.current) {
        windowRef.current.close();
        windowRef.current = null;
      }
      if (onClose) {
        onClose();
      }
    });
    return () => {
      if (s && s.connected) {
        s.disconnect();
      }
    };
  }, [onClose, setUser]);

  const [username, setUsername] = useState('');
  const handleAnonLogin = useCallback(() => {
    async function login() {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length) {
        const user = await anonymousLogin(trimmedUsername);
        setUser(user);
        if (onClose) {
          onClose();
        }
      }
    }
    login();
  }, [username, setUser, onClose]);
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [setUsername]
  );
  const handleOAuth = useCallback(
    (provider: string) => {
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      const url = `${API_URL}/${provider}?socketId=${socket!.id}`;

      windowRef.current = window.open(
        url,
        '',
        `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
      );
    },
    [socket]
  );
  const handleGitHub = useCallback(() => handleOAuth('github'), [handleOAuth]);
  const handleGoogle = useCallback(() => handleOAuth('google'), [handleOAuth]);
  const handleTwitter = useCallback(() => handleOAuth('twitter'), [
    handleOAuth,
  ]);
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  return (
    <Dialog
      fullScreen={false}
      maxWidth="xs"
      fullWidth
      open
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogContent>
        {!hasNoSocialMediaAuth ? (
          <>
            <Card>
              <CardHeader title={loginTranslations.socialMediaAuthHeader} />
              <CardContent>
                <Alert severity="info">
                  {loginTranslations.socialMediaAuthDescription}
                </Alert>
                <AccountsButtons>
                  {config.GitHubAuthEnabled && (
                    <GithubLoginButton
                      onClick={handleGitHub}
                      text={loginTranslations.authenticatingWith + ' GitHub'}
                    />
                  )}
                  {config.GoogleAuthEnabled && (
                    <GoogleLoginButton
                      onClick={handleGoogle}
                      text={loginTranslations.authenticatingWith + ' Google'}
                    />
                  )}
                  {config.TwitterAuthEnabled && (
                    <TwitterLoginButton
                      onClick={handleTwitter}
                      text={loginTranslations.authenticatingWith + ' Twitter'}
                    />
                  )}
                </AccountsButtons>
              </CardContent>
            </Card>
            <Typography
              variant="h4"
              style={{ textAlign: 'center', margin: 20 }}
            >
              {loginTranslations.or}
            </Typography>
          </>
        ) : null}
        <Card>
          <CardHeader title={loginTranslations.anonymousAuthHeader} />
          <CardContent>
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
            <CardActions style={{ justifyContent: 'flex-end' }}>
              <Button
                onClick={handleAnonLogin}
                color="primary"
                autoFocus
                disabled={!username.trim().length}
              >
                {loginTranslations.buttonLabel}
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

const AccountsButtons = styled.div`
  margin-top: 30px;
`;

export default Login;
