import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Login from '../../auth/modal/LoginModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);
  return (
    <Container>
      <Login onClose={handleClose} />
    </Container>
  );
}

const Container = styled.div``;
