import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, Hidden } from '@mui/material';
import useIsPro from 'auth/useIsPro';
import ProButton from 'components/ProButton';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import useUser from 'state/user/useUser';
import { useMatch, useNavigate } from 'react-router-dom';
import useSidePanel from 'views/panel/useSidePanel';
import Invite from './Invite';
import AccountMenu from 'auth/AccountMenu';
import ProPill from 'components/ProPill';
import { AiButton } from './ai/AiButton';
import logoIcon from './logo-white.png';
import logoText from './text-white.png';
import config from 'utils/getConfig';

export function Header() {
  const user = useUser();
  const isPro = useIsPro();
  const navigate = useNavigate();
  const displayGoPro = !isPro && user && user.accountType !== 'anonymous';
  const goToHome = useCallback(() => navigate('/'), [navigate]);
  const { toggle: togglePanel } = useSidePanel();
  const isOnGamePage = !!useMatch('game/:gameId/*');
  return (
    <AppBar
      position="sticky"
      style={{
        backgroundColor: config.HEADER_PRIMARY_COLOR || undefined,
        color: config.HEADER_SECONDARY_COLOR || undefined,
      }}
    >
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
        <MainTitle onClick={goToHome} data-cy="header-home-button">
          <img
            src={config.LOGO ? config.LOGO : logoIcon}
            alt="Retrospected Icon"
            height="30"
          />
          {!config.LOGO ? (
            <img src={logoText} alt="Retrospected" height="30" />
          ) : null}
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
        {user ? <AiButton /> : null}
        <Spacer />
        {isOnGamePage ? <Invite /> : null}
        <AccountMenu />
      </Toolbar>
    </AppBar>
  );
}

const MainTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-left: 10px;
  margin-right: 20px;
  > :nth-of-type(2) {
    position: relative;
    top: 2px;
  }

  @media screen and (max-width: 800px) {
    > :nth-of-type(2) {
      display: none;
    }
  }

  @media screen and (max-width: 400px) {
    display: none;
  }
`;

const ProPillContainer = styled.div``;

const GoProContainer = styled.div`
  margin-left: 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;
