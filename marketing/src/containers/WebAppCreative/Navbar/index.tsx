import React, { useContext } from 'react';
import Link from 'next/link';
import NavbarWrapper from '../../../common/components/Navbar';
import Drawer from '../../../common/components/Drawer';
import Button from '../../../common/components/Button';
import Logo from '../../../common/components/UIElements/Logo';
import Box from '../../../common/components/Box';
import HamburgMenu from '../../../common/components/HamburgMenu';
import Container from '../../../common/components/UI/Container';
import { DrawerContext } from '../../../common/contexts/DrawerContext';
import ScrollSpyMenu from '../../../common/components/ScrollSpyMenu';
import logoImage from './logo.png';
import { MenuItem } from '@/types';
import { useTranslation } from 'next-i18next';
import { useConfig } from '@/common/hooks/useConfig';

export const menuItems: MenuItem[] = [
  {
    label: 'Nav.home',
    path: '#home',
    offset: '70',
  },
  {
    label: 'Nav.howTo',
    path: '#how-to',
    offset: '70',
  },
  {
    label: 'Nav.features',
    path: '#features',
    offset: '70',
  },
  {
    label: 'Nav.testimonial',
    path: '#testimonial',
    offset: '70',
  },
  {
    label: 'Nav.pricing',
    path: '#pricing',
    offset: '70',
  },
  {
    label: 'Nav.faq',
    path: '#faq',
    offset: '70',
  },
];

type NavbarProps = {
  navbarStyle?: any;
  logoStyle?: any;
  button?: any;
  row?: any;
  menuWrapper?: any;
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
              menuItems={menuItems}
              offset={-70}
            />
            <Link href={`${appUrl}/subscribe`} legacyBehavior>
              <a className="navbar_button navbar_button_one">
                <Button {...button} title={t('Nav.subscribe')} />
              </a>
            </Link>
            <Link href={appUrl!} legacyBehavior>
              <a className="navbar_button navbar_button_two">
                <Button {...button} title={t('Nav.login')} />
              </a>
            </Link>
            <Drawer
              width="420px"
              placement="right"
              drawerHandler={<HamburgMenu barColor="#108AFF" />}
              open={state.isOpen}
              toggleHandler={toggleHandler}
            >
              <ScrollSpyMenu
                className="mobile_menu"
                menuItems={menuItems}
                drawerClose={true}
                offset={-100}
              />
            </Drawer>
          </Box>
        </Box>
      </Container>
    </NavbarWrapper>
  );
};

export default Navbar;
