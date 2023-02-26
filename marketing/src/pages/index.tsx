import React from 'react';
import Head from 'next/head';
import Banner from '../containers/Banner';
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
import {
  CombinedSection,
  CornerPattern,
} from '../containers/webAppCreative.style';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getAllLegalDocuments, LegalDocumentMetadata } from '@/lib/getLegal';
import { MenuItem } from '@/types';
import Layout from '@/containers/Layout/Layout';

type HomePageProps = {
  legals: LegalDocumentMetadata[];
};

export default function HomePage({ legals }: HomePageProps) {
  const { t } = useTranslation();
  return (
    <Layout menuItems={menuItems} legals={legals}>
      <Head>
        <title>{t('SEO.title')}</title>
      </Head>
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
    </Layout>
  );
}

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
  // {
  //   label: 'Nav.testimonial',
  //   path: '#testimonial',
  //   offset: '70',
  // },
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

export async function getStaticProps({ locale }: { locale?: string }) {
  const legals = getAllLegalDocuments();

  return {
    props: {
      legals,
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
