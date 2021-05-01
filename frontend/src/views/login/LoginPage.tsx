import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Login from '../../auth/modal/LoginModal';

export default function LoginPage() {
  const history = useHistory();
  const handleClose = useCallback(() => {
    history.push('/');
  }, [history]);
  return (
    <Container>
      <Login onClose={handleClose} />
    </Container>
  );
}

const Container = styled.div``;
