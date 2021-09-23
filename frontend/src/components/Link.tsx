import BaseLink, { LinkTypeMap } from '@mui/material/Link';
import { colors } from '@mui/material';
import styled from 'styled-components';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';

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
