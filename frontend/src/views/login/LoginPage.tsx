import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../auth/modal/LoginModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-paper">
      <LoginModal onClose={handleClose} large />
    </div>
  );
}
