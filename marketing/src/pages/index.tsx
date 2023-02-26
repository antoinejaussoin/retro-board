import React, { Fragment } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import Sticky from 'react-stickynode';
import { DrawerProvider } from '../common/contexts/DrawerContext';
import { theme } from '../common/theme/webAppCreative';
import ResetCSS from '../common/assets/css/style';
import Banner from '../containers/Banner';
import Navbar from '../containers/Navbar';
import Clients from '../containers/Clients';
import HowItWorks from '../containers/HowItWorks';
import AnalyticsTool from '../containers/AnalyticsTool';
import Dashboard from '../containers/Dashboard';
import Testimonials from '../containers/Testimonials';
import Integrations from '../containers/Integrations';
import Pricing from '../containers/Pricing';
import NewsFeed from '../containers/NewsFeed';
import Faq from '../containers/Faq';
import CallToAction from '../containers/CallToAction';
import Footer from '../containers/Footer';
import {
  GlobalStyle,
  ContentWrapper,
  CombinedSection,
  CornerPattern,
} from '../containers/webAppCreative.style';
import 'animate.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getAllLegalDocuments, LegalDocument } from '@/lib/getLegal';

type HomePageProps = {
  legals: LegalDocument[];
};

export default function HomePage({ legals }: HomePageProps) {
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
          <Banner />
          <Clients />
          <HowItWorks />
          <AnalyticsTool />
          <Dashboard />
          {/* <Testimonials /> */}
          <CombinedSection>
            <Integrations />
            <Pricing />
            <CornerPattern />
          </CombinedSection>
          {/* <NewsFeed /> */}
          <Faq />
          <CallToAction />
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
