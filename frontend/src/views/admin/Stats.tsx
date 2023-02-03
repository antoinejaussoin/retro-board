import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { useAdminStats } from './useAdminStats';

export function Stats() {
  const stats = useAdminStats();

  return (
    <Container>
      <Signal />
      <Typography variant="body2">
        Connected Users: <b>{stats?.clients}</b>
      </Typography>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Signal = styled.div`
  background-color: #44b700;
  color: #44b700;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  animation: ripple 1.2s infinite ease-in-out;
  content: '';

  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
`;
