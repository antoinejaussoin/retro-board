import React, { Fragment } from 'react';
import Head from 'next/head';
import styled, { ThemeProvider } from 'styled-components';
import Sticky from 'react-stickynode';
import 'animate.css';
import { useTranslation } from 'next-i18next';
import { LegalDocument } from '@/lib/getLegal';
import ResetCSS from '@/common/assets/css/style';
import { ContentWrapper, GlobalStyle } from '../webAppCreative.style';
import { DrawerProvider } from '@/common/contexts/DrawerContext';
import Navbar from '../Navbar';
import { theme } from '@/common/theme/webAppCreative';
import Footer from '../Footer';

type HomePageProps = {
  legals: LegalDocument[];
  children: React.ReactNode;
};

export default function Layout({ legals, children }: HomePageProps) {
  const { t } = useTranslation();
  return (
    <ThemeProvider theme={theme}>
      <Fragment>
        <Head>
          <title>{t('SEO.title')}</title>
        </Head>

        <ResetCSS />
        <GlobalStyle />

        <ContentWrapper>
          <Sticky top={0} innerZ={9999} activeClass="sticky-nav-active">
            <DrawerProvider>
              <Navbar />
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
  margin-top: 150px;
`;
