import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  GithubLoginButton,
  GoogleLoginButton,
  TwitterLoginButton,
} from 'react-social-login-buttons';
import styled from 'styled-components';
import io from 'socket.io-client';
import useTranslations, { useLanguage } from '../../translations';
import config from '../../utils/getConfig';
import { updateLanguage } from '../../api';
import { User } from 'retro-board-common';

const API_URL = '/api/auth';

interface SocialAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

function SocialAuth({ onClose, onUser }: SocialAuthProps) {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const windowRef = useRef<Window | null>(null);
  const { Login: loginTranslations } = useTranslations();
  const language = useLanguage();
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

  useEffect(() => {
    const s = io();
    setSocket(s);
    s.on('auth', async (_user: User) => {
      const updatedUser = await updateLanguage(language.value);
      // setUser(updatedUser);
      onUser(updatedUser);
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
  }, [onClose, onUser, language]);

  return (
    <Card>
      <CardHeader title={loginTranslations.socialMediaAuthHeader} />
      <CardContent>
        <Alert severity="info">
          {loginTranslations.socialMediaAuthDescription}
        </Alert>
        <AccountsButtons>
          {config.GitHubAuthEnabled && (
            <GithubLoginButton onClick={handleGitHub} text={'GitHub'} />
          )}
          {config.GoogleAuthEnabled && (
            <GoogleLoginButton onClick={handleGoogle} text={'Google'} />
          )}
          {config.TwitterAuthEnabled && (
            <TwitterLoginButton onClick={handleTwitter} text={'Twitter'} />
          )}
        </AccountsButtons>
      </CardContent>
    </Card>
  );
}

const AccountsButtons = styled.div`
  margin-top: 30px;
`;

export default SocialAuth;