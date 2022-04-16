import { colors } from '@mui/material';
import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';

interface SectionProps {
  title?: string;
  danger?: boolean;
}

export default function Section({
  title,
  danger,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <Container danger={!!danger}>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </Container>
  );
}

const Container = styled.section<{ danger: boolean }>`
  border: 1px solid
    ${(props) => (props.danger ? colors.red[500] : colors.grey[200])};
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: 450px) {
    padding: 5px;
  }

  header {
    color: ${(props) => (props.danger ? colors.red[500] : 'inherit')};
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
