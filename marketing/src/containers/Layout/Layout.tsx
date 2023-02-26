import React, { Fragment } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Sticky from 'react-stickynode';
import 'animate.css';
import { useTranslation } from 'next-i18next';
import { LegalDocumentMetadata } from '@/lib/getLegal';
import ResetCSS from '@/common/assets/css/style';
import { ContentWrapper, GlobalStyle } from '../webAppCreative.style';
import { DrawerProvider } from '@/common/contexts/DrawerContext';
import Navbar from '../Navbar';
import { theme } from '@/common/theme/webAppCreative';
import Footer from '../Footer';
import { MenuItem } from '@/types';

type HomePageProps = {
  legals: LegalDocumentMetadata[];
  menuItems: MenuItem[];
  children: React.ReactNode;
};

export default function Layout({ legals, menuItems, children }: HomePageProps) {
  return (
    <ThemeProvider theme={theme}>
      <Fragment>
        <ResetCSS />
        <GlobalStyle />

        <ContentWrapper>
          <Sticky top={0} innerZ={9999} activeClass="sticky-nav-active">
            <DrawerProvider>
              <Navbar items={menuItems} />
            </DrawerProvider>
          </Sticky>
          <Content>{children}</Content>
          <Footer legals={legals} />
        </ContentWrapper>
      </Fragment>
    </ThemeProvider>
  );
}

const Content = styled.div`
  margin-top: 108px;
`;
