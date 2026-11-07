import { KeyRound, LogOut, Sparkles, UserRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { logout } from '../api';
import Avatar from '../components/Avatar';
import { useSetUser } from 'state/user/useSetUser';
import useUser from '../state/user/useUser';
import { Button } from 'ui/button';
import { Chip } from 'ui/chip';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from 'ui/menu';
import useIsAdmin from './useIsAdmin';
import LoginModal from './modal/LoginModal';

const AccountMenu = () => {
  const { t } = useTranslation();
  const setUser = useSetUser();
  const [modalOpened, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = useUser();
  const isAdmin = useIsAdmin();
  const isOnRoot = useMatch('/');
  const isNotAnon = user && user.accountType !== 'anonymous';

  const handleModalOpen = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      evt.stopPropagation();
      setModalOpen(true);
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    navigate('/');
  }, [setUser, navigate]);

  if (user) {
    return (
      <Menu>
        <MenuTrigger>
          <button
            type="button"
            data-cy="account-menu"
            className="flex items-center gap-3 rounded-full py-1 pr-1 pl-3 hover:bg-white/10"
          >
            <span className="hidden max-w-48 truncate text-sm min-[800px]:block">
              {user.name}
            </span>
            {user.accountType === 'anonymous' ? (
              <span className="hidden min-[900px]:inline">
                <Chip tone="secondary">{t('Header.anonymous')}</Chip>
              </span>
            ) : null}
            <Avatar user={user} />
          </button>
        </MenuTrigger>
        <MenuContent>
          {user && !user.pro && user.accountType !== 'anonymous' ? (
            <MenuItem
              onSelect={() => navigate('/subscribe')}
              data-cy="account-menu-go-pro"
            >
              <Sparkles className="size-4 text-amber-600" />
              Go Pro!
            </MenuItem>
          ) : null}
          <MenuItem
            onSelect={() => navigate('/account')}
            data-cy="account-menu-account"
          >
            <UserRound className="size-4" />
            {t('Header.account')}
          </MenuItem>
          {isAdmin ? (
            <MenuItem
              onSelect={() => navigate('/admin')}
              data-cy="account-menu-admin"
            >
              <KeyRound className="size-4" />
              {t('Header.adminPanel')}
            </MenuItem>
          ) : null}
          {isAdmin || isNotAnon ? <MenuSeparator /> : null}
          <MenuItem onSelect={handleLogout} data-cy="account-menu-logout">
            <LogOut className="size-4" />
            {t('Header.logout')}
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  }

  if (isOnRoot) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleModalOpen}
        variant="secondary"
        data-cy="login-button"
      >
        <UserRound className="size-4" />
        {t('AnonymousLogin.header')}
      </Button>
      {modalOpened && <LoginModal onClose={handleModalClose} large />}
    </>
  );
};

export default AccountMenu;
