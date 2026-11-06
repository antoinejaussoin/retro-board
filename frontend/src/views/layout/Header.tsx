import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
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
import { tokens } from 'tokens';

export function Header() {
  const user = useUser();
  const isPro = useIsPro();
  const navigate = useNavigate();
  const displayGoPro = !isPro && user && user.accountType !== 'anonymous';
  const goToHome = useCallback(() => navigate('/'), [navigate]);
  const { toggle: togglePanel } = useSidePanel();
  const isOnGamePage = !!useMatch('game/:gameId/*');
  const branded = Boolean(config.HEADER_PRIMARY_COLOR);
  const inkDefaultLogo = !branded && !config.LOGO;
  return (
    <AppBar
      position="sticky"
      elevation={0}
      style={{
        backgroundColor: branded ? config.HEADER_PRIMARY_COLOR : tokens.paper,
        color: branded
          ? config.HEADER_SECONDARY_COLOR || '#fff'
          : tokens.ink,
        borderBottom: branded ? 'none' : `1px solid ${tokens.border}`,
      }}
    >
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="Menu"
          onClick={togglePanel}
          size="large"
          data-cy="side-panel-toggle"
        >
          <MenuIcon />
        </IconButton>
        <MainTitle
          onClick={goToHome}
          data-cy="header-home-button"
          $ink={inkDefaultLogo}
        >
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
          <GoProContainer>
            <ProButton>
              <Button variant="contained" color="secondary">
                ⭐️ Go Pro!
              </Button>
            </ProButton>
          </GoProContainer>
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

const MainTitle = styled.div<{ $ink: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-left: 10px;
  margin-right: 20px;
  img {
    filter: ${(props) => (props.$ink ? 'brightness(0)' : 'none')};
  }
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

  @media (max-width: 900px) {
    display: none;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;
