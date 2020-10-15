import React from 'react';
import { Link as BaseLink, LinkTypeMap } from '@material-ui/core';
import styled from 'styled-components';
import { DefaultComponentProps } from '@material-ui/core/OverridableComponent';

interface LinkProps extends DefaultComponentProps<LinkTypeMap<{}, 'div'>> {}

function Link({ ...props }: LinkProps) {
  return (
    <Container>
      <BaseLink {...props} />
    </Container>
  );
}

const Container = styled.span`
  cursor: pointer;
`;

export default Link;
