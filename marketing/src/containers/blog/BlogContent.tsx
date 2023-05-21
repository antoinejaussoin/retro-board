import { BlogDocument } from '@/lib/getBlog';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import BlogTitle from './BlogTitle';
import { sourceSerifPro } from '@/common/fonts/Fonts';

type BlogContentProps = {
  document: BlogDocument;
};

type ImageElement = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

const renderers = {
  img: (image: ImageElement) => {
    if (!image.src) {
      return null;
    }
    return <ImageRenderer {...image} />;
  },
  image: (image: any) => {
    return <ImageRenderer {...image} />;
  },
  paragraph: (paragraph: any) => {
    const { node } = paragraph;

    if (node.children[0].tagName === 'img') {
      const image = node.children[0];
      return <ImageRenderer {...image.properties} />;
    }

    return <p>{paragraph.children}</p>;
  },
};

export default function BlogContent({ document }: BlogContentProps) {
  return (
    <>
      <Article className={sourceSerifPro.className}>
        <BlogTitle document={document} />
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img: renderers.img,
            image: renderers.image,
            p: renderers.paragraph,
          }}
        >
          {document.content}
        </ReactMarkdown>
      </Article>
    </>
  );
}

function ImageRenderer({ src, alt }: ImageElement) {
  if (!src) {
    return null;
  }
  const actualSource = src.split(',')[0];
  const size = src.split(',')[1];
  const width = size ? +size.split('x')[0] : undefined;
  const height = size ? +size.split('x')[1] : undefined;
  return (
    <ImageContainer>
      <Image
        src={actualSource!}
        alt={alt!}
        fill={!width && !height}
        width={width}
        height={height}
      />
    </ImageContainer>
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

const Article = styled.article`
  margin: 0 20%;
  color: rgb(41, 41, 41);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    margin: 0 10px;
  }

  @supports (initial-letter: 2) {
    > p:first-of-type::first-letter {
      initial-letter: 2;
      margin-right: 0.5rem;
    }
  }

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
