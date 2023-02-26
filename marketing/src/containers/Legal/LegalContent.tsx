import PostBody from '@/common/components/Markdown/PostBody';
import NextImage from '@/common/components/NextImage';
import styled from 'styled-components';
import background from './background.svg';

type LegalContent = {
  content: string;
};

export default function LegalContent({ content }: LegalContent) {
  return (
    <Container>
      <NextImage src={background} alt="Background image for a legal document" />
      <PostBody content={content} />
    </Container>
  );
}

const Container = styled.div`
  margin: 30px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px;
  position: relative;

  img {
    z-index: -1;
    position: absolute;
    top: 20px;
    right: 10px;
    opacity: 0.1;
  }
`;
