import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Login from '../../auth/modal/LoginModal';

export default function LoginPage() {
  const history = useNavigate();
  const handleClose = useCallback(() => {
    history('/');
  }, [history]);
  return (
    <Container>
      <Login onClose={handleClose} />
    </Container>
  );
}

const Container = styled.div``;
