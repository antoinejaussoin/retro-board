import { BlogDocument } from '@/lib/getBlog';
import Image from 'next/image';
import Markdown, { type Components, type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import BlogTitle from './BlogTitle';
import { sourceSerifPro } from '@/common/fonts/Fonts';
import type { ComponentPropsWithoutRef } from 'react';

type BlogContentProps = {
  document: BlogDocument;
};

type MarkdownImageProps = ComponentPropsWithoutRef<'img'> & ExtraProps;

type MarkdownParagraphProps = ComponentPropsWithoutRef<'p'> & ExtraProps;

function ImageRenderer({
  src,
  alt,
}: {
  src?: string | Blob;
  alt?: string | null;
}) {
  if (!src || typeof src !== 'string') {
    return null;
  }
  const actualSource = src.split(',')[0];
  const size = src.split(',')[1];
  const width = size ? +size.split('x')[0] : undefined;
  const height = size ? +size.split('x')[1] : undefined;
  return (
    <ImageContainer>
      <Image
        src={actualSource}
        alt={alt ?? ''}
        fill={!width && !height}
        width={width}
        height={height}
      />
    </ImageContainer>
  );
}

const markdownComponents: Components = {
  img: ({ src, alt }: MarkdownImageProps) => (
    <ImageRenderer src={src} alt={alt} />
  ),
  p: ({ children, node }: MarkdownParagraphProps) => {
    const firstChild = node?.children?.[0];
    if (
      firstChild &&
      'tagName' in firstChild &&
      firstChild.tagName === 'img' &&
      'properties' in firstChild
    ) {
      const properties = firstChild.properties as {
        src?: string;
        alt?: string;
      };
      return <ImageRenderer src={properties.src} alt={properties.alt} />;
    }

    return <p>{children}</p>;
  },
};

export default function BlogContent({ document }: BlogContentProps) {
  return (
    <Article className={sourceSerifPro.className} dropcap={document.dropcap}>
      <BlogTitle document={document} />
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {document.content}
      </Markdown>
    </Article>
  );
}

const ImageContainer = styled.div`
  display: block;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  max-width: 100%;
  padding: 0;

  > img {
    padding: 20px;
    object-fit: contain;
    aspect-ratio: unset;
    max-width: 100%;
    width: auto;
    height: auto;
  }
`;

const Article = styled.article<{ dropcap: boolean }>`
  margin: 0 20%;
  color: rgb(41, 41, 41);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    margin: 0 10px;
  }

  ${(p) =>
    p.dropcap
      ? `
  @supports (initial-letter: 2) {
    > p:first-of-type::first-letter {
      initial-letter: 2;
      margin-right: 0.5rem;
    }
  }`
      : null}

  p {
    line-height: 32px;
    color: rgb(41, 41, 41);
    text-align: justify;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  h1 {
    font-size: 1.7rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.4rem;
  }

  h3 {
    font-size: 1.35rem;
  }

  h4 {
    font-size: 1.3rem;
  }

  h5 {
    font-size: 1.25rem;
  }

  ul {
    padding-left: 1.5rem;
    li {
      list-style: '- ';
      line-height: 32px;
    }
  }

  ol {
    padding-left: 1.5rem;
    li {
      list-style: decimal;
      line-height: 32px;
    }
  }

  blockquote {
    margin-left: -2rem;
    padding-left: 2rem;
    border-left: 4px solid rgb(41, 41, 41);
    font-style: italic;
  }

  pre {
    display: block;
    padding: 1.5rem 0;
    code {
      background-color: #f6f8fa;
      padding: 20px;
    }
  }

  p {
    code {
      display: inline-block;
      padding: 0 1rem;
      background-color: #f6f8fa;
    }
  }
`;
