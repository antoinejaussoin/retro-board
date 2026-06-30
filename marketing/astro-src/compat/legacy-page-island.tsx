import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import ErrorPage from 'next/error';
import styled from 'styled-components';
import Banner from '../../src/containers/Banner';
import Clients from '../../src/containers/Clients';
import HowItWorks from '../../src/containers/HowItWorks';
import AnalyticsTool from '../../src/containers/AnalyticsTool';
import Dashboard from '../../src/containers/Dashboard';
import Integrations from '../../src/containers/Integrations';
import Pricing from '../../src/containers/Pricing';
import NewsFeed from '../../src/containers/NewsFeed';
import Faq from '../../src/containers/Faq';
import CallToAction from '../../src/containers/CallToAction';
import Layout from '../../src/containers/Layout/Layout';
import { Callback } from '../../src/containers/Callback/Callback';
import BlogContent from '../../src/containers/blog/BlogContent';
import LegalContent from '../../src/containers/Legal/LegalContent';
import bg from '../../src/containers/404/bg.gif';
import { CombinedSection, CornerPattern } from '../../src/containers/webAppCreative.style';
import type { MenuItem } from '../../src/types';
import { useTranslation } from './next-i18next';
import type { Dictionary } from '../lib/dictionary';
import { defaultLocale, supportedLocales, type SupportedLocale } from '../lib/locales';
import { RouterProvider, useRouter, type LegacyRouter } from './next/router';
import { TranslationProvider } from './next-i18next';
import type { BlogDocument, BlogMetadata } from '../../src/lib/getBlog';
import type { LegalDocument, LegalDocumentMetadata } from '../../src/lib/getLegal';

const homeMenuItems: MenuItem[] = [
  { label: 'Nav.home', path: '#home', offset: '70' },
  { label: 'Nav.features', path: '#features', offset: '70' },
  { label: 'Nav.pricing', path: '#pricing', offset: '70' },
  { label: 'Nav.selfhosting', path: '#self-hosting', offset: '70' },
  { label: 'Nav.faq', path: '#faq', offset: '70' },
];

const secondaryMenuItems: MenuItem[] = [{ label: 'Nav.home', path: '/', offset: '70' }];

type HomePageProps = {
  legals: LegalDocumentMetadata[];
  blogs: BlogMetadata[];
  locale: string;
};

type BlogPageProps = {
  document: BlogDocument;
  legals: LegalDocumentMetadata[];
};

type LegalPageProps = {
  document: LegalDocument;
  legals: LegalDocumentMetadata[];
};

function HomePage({ legals, blogs, locale }: HomePageProps) {
  const { t } = useTranslation();
  const seoTitle = String(t('SEO.title'));

  return (
    <Layout menuItems={homeMenuItems} legals={legals}>
      <Head>
        <title>{seoTitle}</title>
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
      <Callback />
    </Layout>
  );
}

function BlogPage({ document, legals }: BlogPageProps) {
  const router = useRouter();
  const title = `${document.title} | Retrospected`;

  if (!router.isFallback && !document) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{document.title}</title>
        <meta name="description" content={document.subtitle} />
        <meta name="author" content={document.author} />
        <meta name="date" content={document.date} />
        <meta name="keywords" content={document.keywords} />
        <meta property="og:title" content={document.title} key="og:title" />
        <meta property="og:description" content={document.subtitle} key="og:description" />
        <meta property="og:type" content="article" key="og:type" />
        <meta property="article:author" content={document.author} key="article:author" />
        <meta property="og:image" content={document.cover} key="og:image" />
      </Head>
      <Layout legals={legals} menuItems={secondaryMenuItems}>
        <article>
          <Head>
            <title>{title}</title>
          </Head>
          <Content>
            <BlogContent document={document} />
          </Content>
        </article>
      </Layout>
    </>
  );
}

function LegalPage({ document, legals }: LegalPageProps) {
  const router = useRouter();

  if (!router.isFallback && !document) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout legals={legals} menuItems={secondaryMenuItems}>
      <article>
        <Head>
          <title>{`${document.title} | Retrospected`}</title>
        </Head>
        <LegalContent content={document.content} />
      </article>
    </Layout>
  );
}

function Page404() {
  const { t } = useTranslation();
  const heading = String(t('404.heading'));
  const text = String(t('404.text'));
  const linkText = String(t('404.link'));

  return (
    <Page>
      <Background src={bg} alt="background" />
      <Container>
        <Title>{heading}</Title>
        <Description>{text}</Description>
        <StyledLink href="/">{linkText}</StyledLink>
      </Container>
    </Page>
  );
}

const Background = styled(Image as any)`
  opacity: 0.5;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90vh;
  font-family: 'Manrope', sans-serif;
`;

const Container = styled.main`
  margin: 20px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 50px 20px 50px;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 4rem;
`;

const Description = styled.p`
  text-align: center;
`;

const StyledLink = styled(Link as any)`
  padding-top: 20px;
  text-align: center;
  color: #e91e63;
  text-decoration: none;

  :hover {
    text-decoration: wavy underline;
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const pageComponents = {
  '404': Page404,
  home: HomePage,
  blog: BlogPage,
  legal: LegalPage,
} as const;

export type LegacyPageKey = keyof typeof pageComponents;

type LegacyPageIslandProps = {
  page: LegacyPageKey;
  pageProps: Record<string, unknown>;
  locale: SupportedLocale;
  dictionary: Dictionary;
  asPath: string;
  pathname: string;
};

export default function LegacyPageIsland({
  page,
  pageProps,
  locale,
  dictionary,
  asPath,
  pathname,
}: LegacyPageIslandProps) {
  const Component = pageComponents[page] as React.ComponentType<Record<string, unknown>>;

  const router: LegacyRouter = {
    locale,
    locales: [...supportedLocales],
    defaultLocale,
    asPath,
    pathname,
    isFallback: false,
    push: async (path) => {
      if (typeof window !== 'undefined') {
        window.location.assign(path);
        return true;
      }

      return false;
    },
    replace: async (path) => {
      if (typeof window !== 'undefined') {
        window.location.replace(path);
        return true;
      }

      return false;
    },
  };

  return (
    <TranslationProvider locale={locale} dictionary={dictionary}>
      <RouterProvider value={router}>
        <Component {...pageProps} />
      </RouterProvider>
    </TranslationProvider>
  );
}