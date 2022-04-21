import { useEffect } from 'react';
import { fetchBackendCapabilities } from '../api';
import { useSetRecoilState } from 'recoil';
import { backendCapabilitiesState } from './state';

const GlobalProvider: React.FC = ({ children }) => {
  const setBackendCapabilities = useSetRecoilState(backendCapabilitiesState);

  useEffect(() => {
    async function loadGlobal() {
      const infos = await fetchBackendCapabilities();
      if (infos) {
        setBackendCapabilities(infos);
      }
    }
    loadGlobal();
  }, [setBackendCapabilities]);

  return <>{children}</>;
};

export default GlobalProvider;
