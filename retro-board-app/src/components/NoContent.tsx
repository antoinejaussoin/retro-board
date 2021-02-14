import styled from 'styled-components';
import { colors } from '@material-ui/core';

interface NoContentProps {
  title: string;
  subtitle?: string;
}

const NoContent = ({ title, subtitle }: NoContentProps) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 50px 0;
`;

const Title = styled.h1`
  color: ${colors.grey[500]};
  font-weight: 300;
  padding: 0 40px;
`;

const Subtitle = styled.h2`
  color: ${colors.grey[500]};
  font-weight: 100;
  font-size: 1em;
  padding: 0 40px;
`;

export default NoContent;
