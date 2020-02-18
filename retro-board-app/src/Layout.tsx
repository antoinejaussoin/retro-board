import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useHistory, Redirect, Switch, Route } from 'react-router-dom';
import { trackPageView } from './track';
import styled from 'styled-components';
import {
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Home from './views/Home';
import Game from './views/Game';
import Panel from './views/Panel';
import Login from './views/Login';
import Invite from './views/layout/Invite';
import Sandbox from './views/Sandbox';
import useGlobalState from './state';
import useLoginFromLocalStorage from './hooks/useLoginFromLocalStorage';
import useIsCompatibleBrowser from './hooks/useIsCompatibleBrowser';
import OutdatedBrowser from './components/OutdatedBrowser';
import useTranslations from './translations';

const Title = styled(Typography)`
  flex-grow: 1;
  color: white;
`;

function App() {
  const translations = useTranslations();
  const history = useHistory();
  useLoginFromLocalStorage();
  const isCompatible = useIsCompatibleBrowser();
  const { state, togglePanel, logout } = useGlobalState();
  const [open, setOpen] = useState(false);
  const goToHome = useCallback(() => history.push('/'), [history]);
  const closeMenu = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => setOpen(true), []);
  const menuAnchor = useRef(null);
  const handleLogout = useCallback(() => {
    closeMenu();
    logout();
  }, [logout, closeMenu]);
  useEffect(() => {
    const unregister = history.listen(location => {
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
          <MainTitle variant="h6" color="inherit" onClick={goToHome}>
            Retrospected
          </MainTitle>
          <Route path="/game/:gameId" component={Invite} />
          <Button color="inherit" buttonRef={menuAnchor} onClick={openMenu}>
            {state.user ? state.user.name : '--'}
          </Button>
          <Menu
            anchorEl={menuAnchor.current}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={closeMenu}
          >
            <MenuItem onClick={handleLogout}>
              {translations.Header.logout}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Route path="/" exact component={Home} />
      <Route path="/sandbox" exact component={Sandbox} />
      <Switch>
        <Redirect from="/session/:gameId" to="/game/:gameId" />
        <Route path="/game/:gameId" component={Game} />
      </Switch>
      {!state.user && <Login />}
      <Panel />
      <OutdatedBrowser show={!isCompatible} />
    </div>
  );
}

const MainTitle = styled(Title)`
  cursor: pointer;
`;

export default App;
