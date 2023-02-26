import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Head from 'next/head';
import markdownToHtml from '@/lib/mdToHtml';
import {
  getAllLegalDocuments,
  getLegalByName,
  LegalDocument,
  LegalDocumentMetadata,
} from '@/lib/getLegal';
import PostBody from '@/common/components/Markdown/PostBody';
import Layout from '@/containers/Layout/Layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type Props = {
  document: LegalDocument;
  legals: LegalDocumentMetadata[];
};

export default function Legal({ document, legals }: Props) {
  const router = useRouter();

  const title = `${document.title} | Retrospected`;
  if (!router.isFallback && !document) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout legals={legals}>
      <article className="mb-32">
        <Head>
          <title>{title}</title>
        </Head>
        <PostBody content={document.content} />
      </article>
    </Layout>
  );
}

type Params = {
  locale?: string;
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params, locale }: Params) {
  const legals = getAllLegalDocuments();
  const document = getLegalByName(params.slug);
  const content = await markdownToHtml(document.content || '');

  return {
    props: {
      legals,
      document: {
        ...document,
        content,
      },
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export async function getStaticPaths({ locales }: { locales: string[] }) {
  const posts = getAllLegalDocuments();

  const paths = {
    paths: locales
      .map((locale) => {
        return posts.map((post) => {
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
