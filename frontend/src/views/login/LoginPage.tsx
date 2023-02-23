import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import LoginModal from '../../auth/modal/LoginModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);
  return (
    <Container>
      <LoginModal onClose={handleClose} />
    </Container>
  );
}

const Container = styled.div``;
