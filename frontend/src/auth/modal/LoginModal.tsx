import { useCallback, useState, useContext } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTranslations from '../../translations';
import UserContext from '../Context';
import SocialAuth from './SocialAuth';
import AnonAuth from './AnonAuth';
import AccountAuth from './AccountAuth';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';

interface LoginModalProps {
  onClose: () => void;
}

const Login = ({ onClose }: LoginModalProps) => {
  const { any } = useOAuthAvailabilities();
  const hasNoSocialMediaAuth = !any;
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
