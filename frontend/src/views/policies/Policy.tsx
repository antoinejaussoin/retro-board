import styled from '@emotion/styled';
import Markdown from 'react-markdown';
import useMd from '../../hooks/useMd';

interface GenericPolicyProps {
  url: string;
}

const GenericPolicy = ({ url }: GenericPolicyProps) => {
  const content = useMd(url);
  return content !== null ? (
    <Container>
      <Markdown>{content}</Markdown>
    </Container>
  ) : (
    <div />
  );
};

const Container = styled.div`
  padding: 50px;
`;

export default GenericPolicy;
