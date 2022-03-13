import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';

type ErrorBoundaryContentProps = {
  onHistoryChange: () => void;
};

export default function ErrorBoundaryContent({
  onHistoryChange,
}: ErrorBoundaryContentProps) {
  const history = useHistory();

  useEffect(() => {
    const unregisterHistoryListener = history.listen(() => {
      onHistoryChange();
    });
    return () => {
      if (unregisterHistoryListener) {
        unregisterHistoryListener();
      }
    };
  }, [onHistoryChange, history]);

  return (
    <Container>
      <Content>
        <Typography variant="h1">Ooopsie...</Typography>
        <Typography variant="h2">
          Something went badly wrong, we logged the error to try and fix it
          ASAP.
        </Typography>
        <Buttons>
          <Button onClick={() => history.push('/')} color="primary">
            Home Page
          </Button>
          <Button onClick={() => window.location.reload()} color="secondary">
            Refresh
          </Button>
        </Buttons>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  position: relative;
  text-align: center;
  margin: 0 auto;
`;

const Content = styled.div`
  margin-top: 200px;
`;

const Buttons = styled.div`
  margin-top: 40px;
`;
