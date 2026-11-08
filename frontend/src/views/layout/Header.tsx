import AccountMenu from 'auth/AccountMenu';
import useIsPro from 'auth/useIsPro';
import ProButton from 'components/ProButton';
import ProPill from 'components/ProPill';
import { Menu } from 'lucide-react';
import { useCallback } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import useUser from 'state/user/useUser';
import { headerTone } from 'Theme';
import { Button } from 'ui/button';
import { cn } from 'ui/cn';
import { IconButton } from 'ui/icon-button';
import config from 'utils/getConfig';
import useSidePanel from 'views/panel/useSidePanel';
import { AiButton } from './ai/AiButton';
import Invite from './Invite';
import logoBlack from './logo-black.png';
import logoWhite from './logo-white.png';
import textBlack from './text-black.png';
import textWhite from './text-white.png';

export function Header() {
  const user = useUser();
  const isPro = useIsPro();
  const navigate = useNavigate();
  const displayGoPro = !isPro && user && user.accountType !== 'anonymous';
  const goToHome = useCallback(() => navigate('/'), [navigate]);
  const { toggle: togglePanel } = useSidePanel();
  const isOnGamePage = !!useMatch('game/:gameId/*');
  const isLoginRoute = !!useMatch({ path: '/login', end: true });
  const isHomeRoute = !!useMatch({ path: '/', end: true });
  const isLoginPage = isLoginRoute || (!user && isHomeRoute);
  const light = headerTone === 'light';
  const mark = config.LOGO || (light ? logoBlack : logoWhite);
  const word = light ? textBlack : textWhite;

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-black/10 px-2 text-header-fg sm:gap-2 sm:px-4"
      style={{
        background: 'var(--brand-header-bg)',
        color: 'var(--brand-header-fg)',
      }}
    >
      <IconButton
        aria-label="Menu"
        onClick={togglePanel}
        data-cy="side-panel-toggle"
        className="hover:bg-white/15"
      >
        <Menu className="size-5" />
      </IconButton>
      <button
        type="button"
        onClick={goToHome}
        data-cy="header-home-button"
        className={cn(
          'flex min-w-0 items-center gap-2.5 rounded-full px-1 py-1',
          !isLoginPage && 'max-[400px]:hidden',
        )}
      >
        <img src={mark} alt="Retrospected" className="h-7 w-auto" />
        {config.LOGO ? null : (
          <img
            src={word}
            alt=""
            className={cn(
              'h-6 w-auto',
              isLoginPage ? 'block' : 'hidden min-[800px]:block',
            )}
          />
        )}
      </button>
      <ProPill small />
      {displayGoPro ? (
        <ProButton>
          <Button variant="secondary" className="ml-2 hidden md:inline-flex">
            Go Pro
          </Button>
        </ProButton>
      ) : null}
      <div className="flex-1" />
      {user ? <AiButton /> : null}
      <div className="w-2" />
      {isOnGamePage ? <Invite /> : null}
      <AccountMenu />
    </header>
  );
}
