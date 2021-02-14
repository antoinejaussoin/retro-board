import styled from 'styled-components';
import Markdown from 'react-markdown';
import useMd from '../../hooks/useMd';

interface GenericPolicyProps {
  url: string;
}

const GenericPolicy = ({ url }: GenericPolicyProps) => {
  const content = useMd(url);
  return content !== null ? (
    <Container>
      <Markdown source={content} />
    </Container>
  ) : (
    <div />
  );
};

const Container = styled.div`
  padding: 50px;
`;

export default GenericPolicy;
