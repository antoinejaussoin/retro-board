import React, { useContext } from 'react';
import NavbarWrapper from '@/common/components/Navbar';
import Drawer from '@/common/components/Drawer';
import Button from '@/common/components/Button';
import Logo from '@/common/components/UIElements/Logo';
import Box from '@/common/components/Box';
import HamburgMenu from '@/common/components/HamburgMenu';
import Container from '@/common/components/UI/Container';
import { DrawerContext } from '@/common/contexts/DrawerContext';
import ScrollSpyMenu from '@/common/components/ScrollSpyMenu';
import logoImage from './logo.png';
import { MenuItem } from '@/types';
import { useTranslation } from 'next-i18next';
import { useConfig } from '@/common/hooks/useConfig';
import { LanguagePicker } from './LanguagePicker';
import styled from 'styled-components';

type NavbarProps = {
  navbarStyle?: any;
  logoStyle?: any;
  button?: any;
  row?: any;
  menuWrapper?: any;
  items: MenuItem[];
};

const Navbar = ({
  navbarStyle = {
    className: 'web_app_creative_navbar',
    minHeight: '70px',
    display: 'block',
  },
  row = {
    flexBox: true,
    alignItems: 'center',
    width: '100%',
  },
  logoStyle = {
    maxWidth: ['126px', '126px'],
  },
  button = {},
  menuWrapper = {
    flexBox: true,
    alignItems: 'center',
  },
  items,
}: NavbarProps) => {
  const { state, dispatch } = useContext(DrawerContext);
  const { t } = useTranslation();
  const { appUrl } = useConfig();

  // Toggle drawer
  const toggleHandler = () => {
    dispatch({
      type: 'TOGGLE',
    });
  };

  return (
    <NavbarWrapper {...navbarStyle}>
      <Container width="1400px">
        <Box {...row}>
          <Logo
            href="#"
            logoSrc={logoImage}
            title="SaaS Creative"
            logoStyle={logoStyle}
            className="main-logo"
            width={32}
            height={32}
          />
          <Box {...menuWrapper} className="mainMenuWrapper">
            <ScrollSpyMenu
              className="main_menu"
              menuItems={items}
              offset={-70}
            />
            <a
              className="navbar_button navbar_button_one"
              href={`${appUrl}/subscribe`}
            >
              <Button {...button} title={t('Nav.subscribe')} />
            </a>
            <a className="navbar_button navbar_button_two" href={appUrl!}>
              <Button {...button} title={t('Nav.login')} />
            </a>
            <LanguageContainer>
              <LanguagePicker />
            </LanguageContainer>
            <Drawer
              width="420px"
              placement="right"
              drawerHandler={<HamburgMenu barColor="#108AFF" />}
              open={state.isOpen}
              toggleHandler={toggleHandler}
            >
              <ScrollSpyMenu
                className="mobile_menu"
                menuItems={items}
                drawer
                offset={-100}
              />
            </Drawer>
          </Box>
        </Box>
      </Container>
    </NavbarWrapper>
  );
};

const LanguageContainer = styled.div`
  margin-left: 25px;
  margin-right: 25px;
  position: relative;
  top: 2px;
`;

export default Navbar;
