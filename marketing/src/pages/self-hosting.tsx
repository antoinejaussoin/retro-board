import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import AnalyticsTool from '@/containers/AnalyticsTool';
import { getAllLegalDocuments, LegalDocumentMetadata } from '@/lib/getLegal';
import Layout from '@/containers/Layout/Layout';
import { MenuItem } from '@/types';
import Head from 'next/head';

export default function SelfHostingPage({
  legals,
}: {
  legals: LegalDocumentMetadata[];
}) {
  const { t } = useTranslation();
  return (
    <Layout menuItems={menuItems} legals={legals}>
      <Head>
        <title>{t('SelfHosted.title')}</title>
      </Head>
      <AnalyticsTool />
    </Layout>
  );
}

export const menuItems: MenuItem[] = [
  {
    label: 'Nav.home',
    path: '/',
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
