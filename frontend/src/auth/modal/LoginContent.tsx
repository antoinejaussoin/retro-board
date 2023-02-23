import { useCallback, useState, useContext } from 'react';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import UserContext from '../Context';
import SocialAuth from './SocialAuth';
import AnonAuth from './AnonAuth';
import AccountAuth from './AccountAuth';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import { Alert } from '@mui/material';

interface LoginContentProps {
  onClose: () => void;
}

type TabType = 'account' | 'social' | 'anon' | null;

export default function LoginContent({ onClose }: LoginContentProps) {
  const { any } = useOAuthAvailabilities();
  const { disableAnonymous, disablePasswords } = useBackendCapabilities();
  const hasNoSocialMediaAuth = !any;
  const hasNoWayOfLoggingIn =
    hasNoSocialMediaAuth && disableAnonymous && disablePasswords;
  const { t } = useTranslation();
  const { setUser } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState<TabType>(
    getDefaultMode(any, !disablePasswords, !disableAnonymous)
  );

  const handleTab = useCallback((_: React.ChangeEvent<{}>, value: string) => {
    setCurrentTab(value as TabType);
  }, []);
  return (
    <>
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
                  label={t('SocialMediaLogin.header')}
                  value="social"
                  data-cy="social-tab"
                />
              ) : null}
              {!disablePasswords ? (
                <Tab
                  label={t('AccountLogin.header')}
                  value="account"
                  data-cy="account-tab"
                />
              ) : null}
              {!disableAnonymous ? (
                <Tab
                  label={t('AnonymousLogin.anonymousAuthHeader')}
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
    </>
  );
}

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
