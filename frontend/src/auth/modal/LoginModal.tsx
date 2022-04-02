import { useCallback, useState, useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useTranslations from '../../translations';
import UserContext from '../Context';
import SocialAuth from './SocialAuth';
import AnonAuth from './AnonAuth';
import AccountAuth from './AccountAuth';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import { Alert } from '@mui/material';

interface LoginModalProps {
  onClose: () => void;
}

type TabType = 'account' | 'social' | 'anon' | null;

const Login = ({ onClose }: LoginModalProps) => {
  const { any } = useOAuthAvailabilities();
  const { disableAnonymous, disablePasswords } = useBackendCapabilities();
  const hasNoSocialMediaAuth = !any;
  const hasNoWayOfLoggingIn =
    hasNoSocialMediaAuth && disableAnonymous && disablePasswords;
  const translations = useTranslations();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const { setUser } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState<TabType>(
    getDefaultMode(any, !disablePasswords, !disableAnonymous)
  );

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  const handleTab = useCallback((_: React.ChangeEvent<{}>, value: string) => {
    setCurrentTab(value as TabType);
  }, []);
  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      open
      onClose={handleClose}
    >
      {hasNoWayOfLoggingIn ? (
        <Alert severity="error">
          Your administrator disabled all login possibilities (OAuth, password,
          anonymous). Ask your administrator to re-enable at least one.
        </Alert>
      ) : (
        <>
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
                <Tab
                  label={translations.SocialMediaLogin.header}
                  value="social"
                  data-cy="social-tab"
                />
              ) : null}
              {!disablePasswords ? (
                <Tab
                  label={translations.AccountLogin.header}
                  value="account"
                  data-cy="account-tab"
                />
              ) : null}
              {!disableAnonymous ? (
                <Tab
                  label={translations.AnonymousLogin.anonymousAuthHeader}
                  value="anon"
                  data-cy="anon-tab"
                />
              ) : null}
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
        </>
      )}
    </Dialog>
  );
};

function getDefaultMode(
  oauth: boolean,
  password: boolean,
  anon: boolean
): TabType {
  if (oauth) {
    return 'social';
  }

  if (password) {
    return 'account';
  }

  if (anon) {
    return 'anon';
  }

  return null;
}

export default Login;
