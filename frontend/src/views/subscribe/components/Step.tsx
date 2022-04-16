import styled from '@emotion/styled';
import { colors } from '@mui/material';
import { PropsWithChildren } from 'react';

interface StepProps {
  index: number;
  title?: string;
  description?: string;
}

export default function Step({
  index,
  title,
  description,
  children,
}: PropsWithChildren<StepProps>) {
  return (
    <Container>
      <Index>{index}</Index>
      <Main>
        <Header>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Header>
        <Content>{children}</Content>
      </Main>
    </Container>
  );
}

const Container = styled.div`
  border: 1px solid ${colors.grey[200]};
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  display: flex;

  @media screen and (max-width: 450px) {
    padding: 5px;
  }
`;

const Index = styled.div`
  align-self: center;
  font-size: 4em;
  font-weight: 100;
  margin-right: 20px;
  color: ${colors.grey[500]};

  @media screen and (max-width: 600px) {
    font-size: 1.5em;
    margin-right: 5px;
    align-self: flex-start;
  }
`;

const Main = styled.div``;

const Header = styled.div`
  padding-bottom: 20px;
`;

const Title = styled.div`
  font-size: 2em;
  font-weight: 100;
  padding-bottom: 10px;

  @media screen and (max-width: 600px) {
    font-size: 1.5em;
  }
`;

const Description = styled.div``;

const Content = styled.div``;
