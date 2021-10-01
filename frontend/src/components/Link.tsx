import BaseLink, { LinkTypeMap } from '@mui/material/Link';
import { colors } from '@mui/material';
import styled from '@emotion/styled';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';

interface LinkProps extends DefaultComponentProps<LinkTypeMap<{}, 'a'>> {}

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
