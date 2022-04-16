import { PropsWithChildren, useEffect } from 'react';
import { fetchBackendCapabilities } from '../api';
import { useSetRecoilState } from 'recoil';
import { backendCapabilitiesState } from './state';

export default function GlobalProvider({ children }: PropsWithChildren<{}>) {
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
}
