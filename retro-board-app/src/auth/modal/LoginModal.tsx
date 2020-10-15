import React, { useCallback, useState, useContext } from 'react';
import {
  Dialog,
  Button,
  DialogContent,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  useMediaQuery,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations, { useLanguage } from '../../translations';
import UserContext from '../Context';
import { anonymousLogin, updateLanguage } from '../../api';
import config from '../../utils/getConfig';
import SocialAuth from './SocialAuth';

interface LoginModalProps {
  onClose: () => void;
}

const Login = ({ onClose }: LoginModalProps) => {
  const hasNoSocialMediaAuth =
    !config.GoogleAuthEnabled &&
    !config.TwitterAuthEnabled &&
    !config.GitHubAuthEnabled;
  const { Login: loginTranslations } = useTranslations();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const language = useLanguage();
  const { setUser } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState(
    hasNoSocialMediaAuth ? 'account' : 'social'
  );

  const [username, setUsername] = useState('');
  const handleAnonLogin = useCallback(() => {
    async function login() {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length) {
        await anonymousLogin(trimmedUsername);
        const updatedUser = await updateLanguage(language.value);
        setUser(updatedUser);
        if (onClose) {
          onClose();
        }
      }
    }
    login();
  }, [username, setUser, onClose, language]);
  const handleAccountogin = useCallback(() => {}, []);
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    [setUsername]
  );

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  const handleTab = useCallback((_: React.ChangeEvent<{}>, value: string) => {
    setCurrentTab(value);
  }, []);
  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      open
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <AppBar position="static" color="default">
        <Tabs
          value={currentTab}
          onChange={handleTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {!hasNoSocialMediaAuth ? (
            <Tab
              label={loginTranslations.socialMediaAuthHeader}
              value="social"
            />
          ) : null}
          <Tab label={'account'} value="account" />
          <Tab label={loginTranslations.anonymousAuthHeader} value="anon" />
        </Tabs>
      </AppBar>
      <DialogContent>
        {currentTab === 'social' ? (
          <SocialAuth onClose={onClose} onUser={setUser} />
        ) : null}
        {currentTab === 'account' ? (
          <Card>
            <CardHeader title={'account'} />
            <CardContent>
              <Alert severity="info">Todo</Alert>

              <CardActions style={{ justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleAccountogin}
                  color="primary"
                  autoFocus
                  disabled={!username.trim().length}
                >
                  {loginTranslations.buttonLabel}
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        ) : null}
        {currentTab === 'anon' ? (
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default Login;
