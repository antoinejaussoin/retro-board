import React from 'react';
import styled from 'styled-components';

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  color: string;
  description: string;
}

function Feature({ icon, title, color, description }: FeatureProps) {
  return (
    <Container>
      <Icon color={color}>{icon}</Icon>
      <Main>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  box-shadow: 2px 2px 5px 2px rgba(224, 224, 224, 1);
`;
const Icon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  > svg {
    color: ${(props) => props.color};
  }
`;
const Main = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px;
`;
const Title = styled.div`
  font-weight: 100;
  font-size: 1.5rem;
`;
const Description = styled.div`
  margin-top: 5px;
  max-width: 500px;
`;

export default Feature;
