import { BlogDocument } from '@/lib/getBlog';
import styled from 'styled-components';

type BlogTitleProps = {
  document: BlogDocument;
};

export default function BlogTitle({ document }: BlogTitleProps) {
  return (
    <Container>
      <h1>{document.title}</h1>
      <h2>{document.subtitle}</h2>
    </Container>
  );
}

const Container = styled.header`
  margin-bottom: 3rem;
  h1 {
    font-size: 2rem;
    line-height: 2.5rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.3rem;
    line-height: 28px;
    font-weight: 400;
    color: rgb(117, 117, 117);
    margin-top: -1.5rem;
  }
`;
