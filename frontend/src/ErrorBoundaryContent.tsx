import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type ErrorBoundaryContentProps = {
  onHistoryChange: () => void;
};

export default function ErrorBoundaryContent({
  onHistoryChange,
}: ErrorBoundaryContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLocation] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== initialLocation) {
      onHistoryChange();
    }
  }, [location.pathname, initialLocation, onHistoryChange]);

  return (
    <Container>
      <Content>
        <Typography variant="h1">Ooopsie...</Typography>
        <Typography variant="h2">
          Something went badly wrong, we logged the error to try and fix it
          ASAP.
        </Typography>
        <Buttons>
          <Button onClick={() => navigate('/')} color="primary">
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
