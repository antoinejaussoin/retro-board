import React from 'react';
import Head from 'next/head';
import Banner from '../containers/Banner';
import Clients from '../containers/Clients';
import HowItWorks from '../containers/HowItWorks';
import AnalyticsTool from '../containers/AnalyticsTool';
import Dashboard from '../containers/Dashboard';
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
import { BlogMetadata, getAllBlogs, getAllBlogsForLocale } from '@/lib/getBlog';

type HomePageProps = {
  legals: LegalDocumentMetadata[];
  blogs: BlogMetadata[];
  locale: string;
};

export default function HomePage({ legals, blogs, locale }: HomePageProps) {
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
      <CombinedSection>
        <Integrations />
        <CornerPattern />
      </CombinedSection>
      <NewsFeed articles={blogs} locale={locale} />
      <CombinedSection>
        <Pricing />
        <CornerPattern />
      </CombinedSection>
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
    label: 'Nav.features',
    path: '#features',
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

export async function getStaticProps({ locale }: { locale?: string }) {
  const legals = getAllLegalDocuments();
  const blogs = getAllBlogsForLocale(locale || 'en');

  return {
    props: {
      legals,
      blogs,
      locale,
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
