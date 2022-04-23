import { useCallback, useState, useRef, useContext } from 'react';
import styled from '@emotion/styled';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import AccountIcon from '@mui/icons-material/AccountCircle';
import useUser from './useUser';
import LoginModal from './modal/LoginModal';
import useTranslation from '../translations/useTranslations';
import { logout } from '../api';
import UserContext from './Context';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { Key, Logout, Star } from '@mui/icons-material';
import { colors, Divider, ListItemIcon, ListItemText } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import useIsAdmin from './useIsAdmin';

const AccountMenu = () => {
  const translations = useTranslation();
  const { setUser } = useContext(UserContext);
  const [modalOpened, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchor = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const user = useUser();
  const isAdmin = useIsAdmin();
  const isNotAnon = user && user.accountType !== 'anonymous';

  const handleModalOpen = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      evt.stopPropagation();
      setModalOpen(true);
    },
    []
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, [setUser]);

  const handleAccount = useCallback(() => {
    navigate('/account');
    setMenuOpen(false);
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
    setMenuOpen(false);
  }, [navigate]);

  const handleSubscribe = useCallback(() => {
    navigate('/subscribe');
    setMenuOpen(false);
  }, [navigate]);

  if (user) {
    return (
      <div style={{ position: 'relative' }}>
        <AvatarContainer onClick={openMenu} ref={menuAnchor}>
          <Avatar user={user} />
          <DisplayName>{user.name}</DisplayName>
        </AvatarContainer>
        {menuAnchor.current ? (
          <Menu
            anchorEl={menuAnchor.current}
            open={menuOpen}
            onClose={closeMenu}
          >
            {user && !user.pro && user.accountType !== 'anonymous' ? (
              <MenuItem onClick={handleSubscribe}>
                <ListItemIcon>
                  <Star
                    style={{
                      color: colors.yellow[700],
                      position: 'relative',
                      top: -1,
                    }}
                  />
                </ListItemIcon>
                <ListItemText>Go Pro!</ListItemText>
              </MenuItem>
            ) : null}
            {isNotAnon ? (
              <MenuItem onClick={handleAccount}>
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText>{translations.Header.account}</ListItemText>
              </MenuItem>
            ) : null}
            {isAdmin ? (
              <MenuItem onClick={handleAdmin}>
                <ListItemIcon>
                  <Key />
                </ListItemIcon>
                <ListItemText>{translations.Header.adminPanel}</ListItemText>
              </MenuItem>
            ) : null}
            {isAdmin || isNotAnon ? <Divider /> : null}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText>{translations.Header.logout}</ListItemText>
            </MenuItem>
          </Menu>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <Button
        onClick={handleModalOpen}
        variant="contained"
        color="secondary"
        data-cy="login-button"
        startIcon={<AccountIcon />}
      >
        {translations.AnonymousLogin.header}
      </Button>
      {modalOpened && <LoginModal onClose={handleModalClose} />}
    </>
  );
};

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  > :first-of-type {
    margin-right: 10px;
  }
`;

const DisplayName = styled.div`
  @media screen and (max-width: 500px) {
    display: none;
  }
  max-width: 200px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export default AccountMenu;
