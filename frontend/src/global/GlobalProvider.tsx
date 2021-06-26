import { useEffect } from 'react';
import { fetchAdminEmail } from '../api';
import { useSetRecoilState } from 'recoil';
import { adminEmailState } from './state';

const GlobalProvider: React.FC = ({ children }) => {
  const setEmail = useSetRecoilState(adminEmailState);

  useEffect(() => {
    async function loadGlobal() {
      const email = await fetchAdminEmail();
      console.log('admin email: ', email);
      setEmail(email);
    }
    loadGlobal();
  }, [setEmail]);

  return <>{children}</>;
};

export default GlobalProvider;
