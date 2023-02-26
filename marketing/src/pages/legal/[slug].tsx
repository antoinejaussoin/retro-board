import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import Container from '../../components/container'
// import PostBody from '../../components/post-body'
// import Header from '../../components/header'
// import PostHeader from '../../components/post-header'
// import Layout from '../../components/layout'
import Head from 'next/head';
import markdownToHtml from '@/lib/mdToHtml';
import {
  getAllLegalDocuments,
  getLegalByName,
  LegalDocument,
} from '@/lib/getLegal';
import PostBody from '@/common/components/Markdown/PostBody';

type Props = {
  document: LegalDocument;
};

export default function Legal({ document }: Props) {
  const router = useRouter();

  const title = `${document.title} | Retrospected`;
  if (!router.isFallback && !document) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    // <Layout preview={preview}>
    //   <Container>
    //     <Header />
    //     {router.isFallback ? (
    //       <PostTitle>Loading…</PostTitle>
    //     ) : (
    //       <>
    <article className="mb-32">
      <Head>
        <title>{title}</title>
        {/* <meta property="og:image" content={post.ogImage.url} /> */}
      </Head>
      {/* <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              /> */}
      <PostBody content={document.content} />
    </article>
    //       </>
    //     )}
    //   </Container>
    // </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const document = getLegalByName(params.slug);
  const content = await markdownToHtml(document.content || '');

  return {
    props: {
      document: {
        ...document,
        content,
      },
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

  console.log('Paths:', paths.paths);

  return paths;
}
