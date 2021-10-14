import { useEffect } from 'react';
import { fetchSelfHostingInfo } from '../api';
import { useSetRecoilState } from 'recoil';
import { backendCapabilitiesState } from './state';
import { loadCsrfToken } from '../api/fetch';

const GlobalProvider: React.FC = ({ children }) => {
  const setBackendCapabilities = useSetRecoilState(backendCapabilitiesState);

  useEffect(() => {
    async function loadGlobal() {
      await loadCsrfToken(); // Make sure the CSRF token is loaded before anything else
      const infos = await fetchSelfHostingInfo();
      if (infos) {
        setBackendCapabilities(infos);
      }
    }
    loadGlobal();
  }, [setBackendCapabilities]);

  return <>{children}</>;
};

export default GlobalProvider;
