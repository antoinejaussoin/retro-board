import { useEffect, useCallback, lazy, Suspense } from 'react';
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  useMatch,
} from 'react-router-dom';
import { trackPageView } from './track';
import styled from '@emotion/styled';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import AccountMenu from './auth/AccountMenu';
import useIsCompatibleBrowser from './hooks/useIsCompatibleBrowser';
import OutdatedBrowser from './components/OutdatedBrowser';
import useIsInitialised from './auth/useIsInitialised';
import useUser from './auth/useUser';
import { HomeOutlined } from '@mui/icons-material';
import ProPill from './components/ProPill';
import { CodeSplitLoader } from './CodeSplitLoader';
import useSidePanel from './views/panel/useSidePanel';
import { Alert, AlertTitle, Button, Hidden } from '@mui/material';
import useBackendCapabilities from './global/useBackendCapabilities';
import useIsPro from 'auth/useIsPro';
import ProButton from 'components/ProButton';
import { useTranslation } from 'react-i18next';
import { Welcome } from 'views/Welcome';

const Home = lazy(() => import('./views/Home'));
const Game = lazy(() => import('./views/Game'));
const LoginPage = lazy(() => import('./views/login/LoginPage'));
const AccountPage = lazy(() => import('./views/account/AccountPage'));
const CancelPage = lazy(() => import('./views/subscribe/CancelPage'));
const SuccessPage = lazy(() => import('./views/subscribe/SuccessPage'));
const SubscribePageOuter = lazy(
  () => import('./views/subscribe/SubscribePageOuter')
);
const ResetPasswordPage = lazy(() => import('./views/Reset'));
const ValidatePage = lazy(() => import('./views/Validate'));
const Invite = lazy(() => import('./views/layout/Invite'));
const Panel = lazy(() => import('./views/Panel'));
const EncryptionDoc = lazy(() => import('./views/home/Encryption'));
const AdminPage = lazy(() => import('./views/admin/AdminPage'));
const Demo = lazy(() => import('./views/Demo'));

const Title = styled(Typography)`
  color: white;
`;

function App() {
  const navigate = useNavigate();
  const backend = useBackendCapabilities();
  const isCompatible = useIsCompatibleBrowser();
  const { toggle: togglePanel } = useSidePanel();
  const isInitialised = useIsInitialised();
  const user = useUser();
  const isPro = useIsPro();
  const displayGoPro = !isPro && user && user.accountType !== 'anonymous';
  const goToHome = useCallback(() => navigate('/'), [navigate]);
  const location = useLocation();
  const isOnGamePage = !!useMatch('game/:gameId/*');
  const { t } = useTranslation();

  // Tracks page views on every location change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div>
      {!backend.licenced ? (
        <Alert title="Unlicenced" severity="error">
          <AlertTitle>{t('Main.unlicenced.title')}</AlertTitle>
          This software is unlicenced. You can obtain a licence{' '}
          <a
            target="_blank"
            href="https://www.retrospected.com/subscribe?product=self-hosted"
            rel="noreferrer"
          >
            here
          </a>
          . A licence will give you, for a one-time fee, unlimited updates,
          access to all pro features for all users, and a dedicated
          administration panel.
        </Alert>
      ) : null}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={togglePanel}
            size="large"
            data-cy="side-panel-toggle"
          >
            <MenuIcon />
          </IconButton>
          <HomeButton>
            <IconButton
              color="inherit"
              aria-label="Home"
              onClick={goToHome}
              size="large"
            >
              <HomeOutlined />
            </IconButton>
          </HomeButton>
          <MainTitle variant="h6" color="inherit" onClick={goToHome}>
            Retrospected&nbsp;
          </MainTitle>
          <ProPillContainer>
            <ProPill small />
          </ProPillContainer>
          {displayGoPro ? (
            <Hidden mdDown>
              <GoProContainer>
                <ProButton>
                  <Button variant="contained" color="secondary">
                    ⭐️ Go Pro!
                  </Button>
                </ProButton>
              </GoProContainer>
            </Hidden>
          ) : null}
          <Spacer />
          {isOnGamePage ? <Invite /> : null}
          {isInitialised ? (
            <AccountMenu />
          ) : (
            <Initialising>{t('Main.loading')}</Initialising>
          )}
        </Toolbar>
      </AppBar>
      <Suspense fallback={<CodeSplitLoader />}>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Welcome />} />
          <Route path="game/:gameId/*" element={<Game />} />
          <Route path="validate" element={<ValidatePage />} />
          <Route path="reset" element={<ResetPasswordPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="demo" element={<Demo />} />
          <Route path="subscribe" element={<SubscribePageOuter />}>
            <Route path="success" element={<SuccessPage />} />
            <Route path="cancel" element={<CancelPage />} />
          </Route>
          <Route path="admin" element={<AdminPage />} />
          <Route path="how-does-encryption-work" element={<EncryptionDoc />} />
        </Routes>
      </Suspense>
      <Panel />
      <OutdatedBrowser show={!isCompatible} />
    </div>
  );
}

const MainTitle = styled(Title)`
  cursor: pointer;
  margin-right: 10px;
  @media screen and (max-width: 600px) {
    display: none;
  }
`;

const HomeButton = styled.div`
  margin-right: 10px;
`;

const ProPillContainer = styled.div``;

const GoProContainer = styled.div`
  margin-left: 20px;
`;

const Initialising = styled.div``;

const Spacer = styled.div`
  flex: 1;
`;

export default App;
