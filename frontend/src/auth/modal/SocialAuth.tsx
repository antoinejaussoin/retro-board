import { useCallback, useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  GithubLoginButton,
  GoogleLoginButton,
  TwitterLoginButton,
  MicrosoftLoginButton,
} from 'react-social-login-buttons';
import io, { type Socket } from 'socket.io-client';
import { useLanguage } from '../../translations';
import { me, updateLanguage } from '../../api';
import type { FullUser } from 'common';
import Wrapper from './Wrapper';
import SlackLoginButton from './social/SlackLoginButton';
import OktaLoginButton from './social/OktaLoginButton';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';
import { useTranslation } from 'react-i18next';

const API_URL = '/api/auth';

const socialButtonStyle: CSSProperties = {
  border: '1px solid #e6dfd4',
  borderRadius: 14,
  boxShadow: 'none',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 500,
  margin: 0,
  width: '100%',
};

interface SocialAuthProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
}

function SocialAuth({ onClose, onUser }: SocialAuthProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const windowRef = useRef<Window | null>(null);
  const { t } = useTranslation();
  const { details } = useOAuthAvailabilities();
  const [language] = useLanguage();
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
      height=${height}, top=${top}, left=${left}`,
      );
    },
    [socket],
  );
  const handleGitHub = useCallback(() => handleOAuth('github'), [handleOAuth]);
  const handleSlack = useCallback(() => handleOAuth('slack'), [handleOAuth]);
  const handleOkta = useCallback(() => handleOAuth('okta'), [handleOAuth]);
  const handleMicrosoft = useCallback(
    () => handleOAuth('microsoft'),
    [handleOAuth],
  );
  const handleGoogle = useCallback(() => handleOAuth('google'), [handleOAuth]);
  const handleTwitter = useCallback(
    () => handleOAuth('twitter'),
    [handleOAuth],
  );

  useEffect(() => {
    const s = io();
    setSocket(s);
    s.on('auth', async (_user: FullUser) => {
      let updatedUser = await me();
      if (updatedUser?.language === null) {
        updatedUser = await updateLanguage(language.locale);
      }
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
    <Wrapper
      header={t('SocialMediaLogin.header')}
      help={t('SocialMediaLogin.info')}
    >
      <div className="mt-6 flex flex-col gap-2.5">
        {details.microsoft && (
          <MicrosoftLoginButton
            onClick={handleMicrosoft}
            text="Microsoft"
            size="42px"
            style={socialButtonStyle}
          />
        )}
        {details.google && (
          <GoogleLoginButton
            onClick={handleGoogle}
            text="Google"
            size="42px"
            style={socialButtonStyle}
          />
        )}
        {details.github && (
          <GithubLoginButton
            onClick={handleGitHub}
            text="GitHub"
            size="42px"
            style={socialButtonStyle}
          />
        )}
        {details.slack && (
          <SlackLoginButton
            onClick={handleSlack}
            text="Slack"
            size="42px"
            style={socialButtonStyle}
          />
        )}
        {details.twitter && (
          <TwitterLoginButton
            onClick={handleTwitter}
            text="Twitter"
            size="42px"
            style={socialButtonStyle}
          />
        )}
        {details.okta && (
          <OktaLoginButton
            onClick={handleOkta}
            text="Okta"
            size="42px"
            style={socialButtonStyle}
          />
        )}
      </div>
    </Wrapper>
  );
}

export default SocialAuth;
