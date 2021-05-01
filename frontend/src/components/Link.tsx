import BaseLink, { LinkTypeMap } from '@material-ui/core/Link';
import deepPurple from '@material-ui/core/colors/deepPurple';
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
  a {
    color: ${deepPurple[500]} !important;
  }
`;

export default Link;
