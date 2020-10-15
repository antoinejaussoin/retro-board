import React from 'react';
import styled from 'styled-components';

interface WrapperProps {
  header?: string;
  actions?: JSX.Element;
}

const Wrapper: React.FC<WrapperProps> = ({ header, actions, children }) => {
  return (
    <Container>
      <Title>{header}</Title>
      <Content>{children}</Content>
      <Actions>{actions}</Actions>
    </Container>
  );
};

const Container = styled.div``;
const Title = styled.div``;
const Content = styled.div``;
const Actions = styled.div``;

export default Wrapper;
