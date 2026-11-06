import styled from '@emotion/styled';
import { HelpButton } from 'components/HelpButton';
import { PropsWithChildren } from 'react';

interface WrapperProps {
  header?: React.ReactNode;
  actions?: React.ReactNode;
  help?: React.ReactNode;
}

export default function Wrapper({
  header,
  help,
  actions,
  children,
}: PropsWithChildren<WrapperProps>) {
  return (
    <Container>
      <TitleContainer>
        <Title>{header}</Title>
        {help ? (
          <Help>
            <HelpButton color="#ccc">{help}</HelpButton>
          </Help>
        ) : null}
      </TitleContainer>
      <Content>{children}</Content>
      <Actions>{actions}</Actions>
    </Container>
  );
}

const Container = styled.div``;
const TitleContainer = styled.div`
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  margin: 12px 0 16px;
  display: flex;
  align-items: center;
`;
const Title = styled.div`
  flex: 1;
`;
const Help = styled.div``;
const Content = styled.div``;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 20px 0 5px 0;
  gap: 10px;
`;
