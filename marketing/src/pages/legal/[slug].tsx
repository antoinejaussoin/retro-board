import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
// import Container from '../../components/container'
// import PostBody from '../../components/post-body'
// import Header from '../../components/header'
// import PostHeader from '../../components/post-header'
// import Layout from '../../components/layout'
import Head from 'next/head';
import markdownToHtml from '@/lib/mdToHtml';
import { getAllPosts, getLegalByName } from '@/lib/getLegal';
import PostBody from '@/common/components/Markdown/PostBody';

type Document = {
  content: string;
  title: string;
};

type Props = {
  document: Document;
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
  const post = getLegalByName(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ]);
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      document: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths({ locales }: { locales: string[] }) {
  const posts = getAllPosts(['slug']);

  return {
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
}
