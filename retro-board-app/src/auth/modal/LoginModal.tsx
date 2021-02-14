import { useCallback, useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  useMediaQuery,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import useTranslations from '../../translations';
import UserContext from '../Context';
import config from '../../utils/getConfig';
import SocialAuth from './SocialAuth';
import AnonAuth from './AnonAuth';
import AccountAuth from './AccountAuth';

interface LoginModalProps {
  onClose: () => void;
}

const Login = ({ onClose }: LoginModalProps) => {
  const hasNoSocialMediaAuth =
    !config.GoogleAuthEnabled &&
    !config.TwitterAuthEnabled &&
    !config.GitHubAuthEnabled &&
    !config.SlackAuthEnabled &&
    !config.MicrosoftAuthEnabled;
  const translations = useTranslations();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const { setUser } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState(
    hasNoSocialMediaAuth ? 'account' : 'social'
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
      maxWidth="sm"
      fullWidth
      open
      onClose={handleClose}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={currentTab}
          onChange={handleTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Login types"
        >
          {!hasNoSocialMediaAuth ? (
            <Tab label={translations.SocialMediaLogin.header} value="social" />
          ) : null}
          <Tab label={translations.AccountLogin.header} value="account" />
          <Tab
            label={translations.AnonymousLogin.anonymousAuthHeader}
            value="anon"
          />
        </Tabs>
      </AppBar>
      <DialogContent>
        {currentTab === 'social' ? (
          <SocialAuth onClose={onClose} onUser={setUser} />
        ) : null}
        {currentTab === 'account' ? (
          <AccountAuth onClose={onClose} onUser={setUser} />
        ) : null}
        {currentTab === 'anon' ? (
          <AnonAuth onClose={onClose} onUser={setUser} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default Login;
