import React, { useEffect, useCallback } from 'react';
import { useHistory, Redirect, Switch, Route } from 'react-router-dom';
import { trackPageView } from './track';
import styled from 'styled-components';
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Home from './views/Home';
import Game from './views/Game';
import Panel from './views/Panel';
import PrivacyPolicyPage from './views/policies/Privacy';
import Invite from './views/layout/Invite';
import AccountMenu from './auth/AccountMenu';
import useGlobalState from './state';
import useIsCompatibleBrowser from './hooks/useIsCompatibleBrowser';
import OutdatedBrowser from './components/OutdatedBrowser';
import useIsInitialised from './auth/useIsInitialised';
import useUser from './auth/useUser';
import TermsAndConditionsPage from './views/policies/Terms';
import CookiesPolicyPage from './views/policies/Cookies';
import AcceptableUsePolicyPage from './views/policies/AcceptableUse';
import DisclaimerPage from './views/policies/Disclaimer';
import { HomeOutlined } from '@material-ui/icons';
import ValidatePage from './views/Validate';
import ResetPasswordPage from './views/Reset';
import SubscribePageOuter from './views/subscribe/SubscribePageOuter';
import SuccessPage from './views/subscribe/SuccessPage';
import CancelPage from './views/subscribe/CancelPage';
import AccountPage from './views/account/AccountPage';
import ProPill from './components/ProPill';
import LoginPage from './views/login/LoginPage';

const Title = styled(Typography)`
  flex-grow: 1;
  color: white;
`;

function App() {
  const history = useHistory();
  const isCompatible = useIsCompatibleBrowser();
  const { togglePanel } = useGlobalState();
  const isInitialised = useIsInitialised();
  const user = useUser();
  const goToHome = useCallback(() => history.push('/'), [history]);
  useEffect(() => {
    trackPageView(window.location.pathname);
    const unregister = history.listen((location) => {
      trackPageView(location.pathname);
    });
    return () => {
      unregister();
    };
  }, [history]);
  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" aria-label="Menu" onClick={togglePanel}>
            <MenuIcon />
          </IconButton>
          <HomeButton>
            <IconButton color="inherit" aria-label="Home" onClick={goToHome}>
              <HomeOutlined />
            </IconButton>
          </HomeButton>
          <MainTitle variant="h6" color="inherit" onClick={goToHome}>
            Retrospected&nbsp;{user?.pro ? <ProPill small /> : null}
          </MainTitle>
          <Route path="/game/:gameId" component={Invite} />
          {isInitialised ? (
            <AccountMenu />
          ) : (
            <Initialising>Loading...</Initialising>
          )}
        </Toolbar>
      </AppBar>
      <Route path="/" exact>
        {user ? <Home /> : null}
      </Route>
      <Switch>
        <Redirect from="/session/:gameId" to="/game/:gameId" />
        <Route path="/game/:gameId" component={Game} />
        <Route path="/validate" component={ValidatePage} />
        <Route path="/reset" component={ResetPasswordPage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/subscribe" component={SubscribePageOuter} exact />
        <Route path="/subscribe/success" component={SuccessPage} exact />
        <Route path="/subscribe/cancel" component={CancelPage} exact />
        <Route path="/privacy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsAndConditionsPage} />
        <Route path="/cookies" component={CookiesPolicyPage} />
        <Route path="/acceptable-use" component={AcceptableUsePolicyPage} />
        <Route path="/disclaimer" component={DisclaimerPage} />
      </Switch>
      <Panel />
      <OutdatedBrowser show={!isCompatible} />
    </div>
  );
}

const MainTitle = styled(Title)`
  cursor: pointer;
  display: flex;
  align-items: center;
  @media screen and (max-width: 600px) {
    display: none;
  }
`;

const HomeButton = styled.div`
  margin-right: 10px;

  @media screen and (max-width: 600px) {
    flex: 1;
  }
`;

const Initialising = styled.div``;

export default App;
