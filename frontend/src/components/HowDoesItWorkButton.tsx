import { colors } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { useHistory } from 'react-router';
import styled from 'styled-components';

interface HowDoesItWorkButtonProps {
  children: React.ReactElement;
  url: string;
}

export default function HowDoesItWorkButton({
  children,
  url,
}: HowDoesItWorkButtonProps) {
  const history = useHistory();
  return (
    <Container>
      {children}

      <LinkContainer>
        <Info />
        <GoLink onClick={() => history.push(url)}>How does that work?</GoLink>
      </LinkContainer>
    </Container>
  );
}

const Container = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
`;

const LinkContainer = styled.div`
  font-size: 0.5em;
  margin-top: 3px;
  > svg {
    font-size: 1.3em;
    color: ${colors.lightBlue[100]};
    margin-right: 3px;
    position: relative;
    top: 1px;
  }
`;

const GoLink = styled.span`
  color: ${colors.lightBlue[100]};
  cursor: pointer;

  :hover {
    text-decoration: underline;
    color: ${colors.lightBlue[500]};
  }
`;
