import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Head from 'next/head';
import {
  BlogDocument,
  BlogMetadata,
  getAllBlogsForLocale,
  getBlogBySlug,
} from '@/lib/getBlog';
import Layout from '@/containers/Layout/Layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MenuItem } from '@/types';
import BlogContent from '@/containers/blog/BlogContent';
import styled from 'styled-components';
import { getAllLegalDocuments } from '@/lib/getLegal';

type Props = {
  document: BlogDocument;
  legals: BlogMetadata[];
};

export const menuItems: MenuItem[] = [
  {
    label: 'Nav.home',
    path: '/',
    offset: '70',
  },
];

export default function Blog({ document, legals }: Props) {
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

        <meta property="og:title" content={document.title} key="og:title" />
        <meta property="og:type" content="article" key="og:type" />
        <meta
          property="article:author"
          content={document.author}
          key="article:author"
        />
        <meta property="og:image" content={document.cover} key="og:image" />
      </Head>
      <Layout legals={legals} menuItems={menuItems}>
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

const Content = styled.div`
  padding: 20px;
`;

type Params = {
  locale?: string;
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params, locale }: Params) {
  const document = getBlogBySlug(params.slug, locale || 'en');
  const legals = getAllLegalDocuments();

  return {
    props: {
      legals,
      document: {
        ...document,
      },
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export async function getStaticPaths({ locales }: { locales: string[] }) {
  const paths = {
    paths: locales
      .map((locale) => {
        return getAllBlogsForLocale(locale).map((post) => {
          return {
            params: {
              slug: post.slug,
            },
            locale,
          };
        });
      })
      .flat(),
    fallback: false,
  };

  return paths;
}
