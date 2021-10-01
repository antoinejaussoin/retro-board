import { colors } from '@mui/material';
import styled from '@emotion/styled';

interface SectionProps {
  title?: string;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </Container>
  );
};

const Container = styled.section`
  border: 1px solid ${colors.grey[200]};
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 450px) {
    padding: 5px;
  }
`;

const Title = styled.header`
  font-size: 2em;
  font-weight: 100;
  margin-bottom: 20px;
  display: block;

  @media screen and (max-width: 600px) {
    font-size: 1.3em;
  }
`;

const Content = styled.div``;

export default Section;
