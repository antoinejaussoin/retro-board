import { colors } from '@material-ui/core';
import { InfoOutlined, Star } from '@material-ui/icons';
import React from 'react';
import styled from 'styled-components';
import useUser from '../auth/useUser';

interface ComponentProp {
  disabled?: boolean;
}

interface ProButtonProps {
  children: React.ReactElement<ComponentProp>;
}

function ProButton({ children }: ProButtonProps) {
  const user = useUser();
  const isPro = user && user.pro;
  const clone = React.cloneElement(children, { disabled: !isPro });

  if (isPro) {
    return <>{clone}</>;
  }

  return (
    <Container>
      <ProPill>
        <Star htmlColor={colors.yellow[500]} fontSize="small" />
        <span>Pro</span>
        <InfoOutlined htmlColor={colors.pink[300]} fontSize="small" />
      </ProPill>
      {clone}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const ProPill = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: -14px;
  right: -5px;
  background-color: ${colors.deepPurple[300]};
  padding: 2px 5px;
  border-radius: 3px;
  color: white;
  font-size: 12px;

  span {
    padding: 0 5px;
  }
`;

export default ProButton;
