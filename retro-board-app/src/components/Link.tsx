import { Link as BaseLink, LinkTypeMap, colors } from '@material-ui/core';
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
    color: ${colors.deepPurple[500]} !important;
  }
`;

export default Link;
