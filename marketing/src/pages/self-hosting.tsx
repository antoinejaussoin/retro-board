import React, { Fragment } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import Sticky from 'react-stickynode';
import { DrawerProvider } from '../common/contexts/DrawerContext';
import { theme } from '../common/theme/webAppCreative';
import ResetCSS from '../common/assets/css/style';
import Navbar from '../containers/Navbar';
import Footer from '../containers/Footer';
import {
  GlobalStyle,
  ContentWrapper,
} from '../containers/webAppCreative.style';
import 'animate.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import AnalyticsTool from '@/containers/AnalyticsTool';
import { getAllLegalDocuments, LegalDocumentMetadata } from '@/lib/getLegal';

export default function SelfHostingPage({
  legals,
}: {
  legals: LegalDocumentMetadata[];
}) {
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
          <AnalyticsTool />
          <Footer legals={legals} />
        </ContentWrapper>
      </Fragment>
    </ThemeProvider>
  );
}

export async function getStaticProps({ locale }: { locale?: string }) {
  const legals = getAllLegalDocuments();

  return {
    props: {
      legals,
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
