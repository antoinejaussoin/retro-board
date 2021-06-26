import { useEffect } from 'react';
import { fetchSelfHostingInfo } from '../api';
import { useSetRecoilState } from 'recoil';
import {
  adminEmailState,
  isLicencedState,
  oauthAvailabilitiesState,
  selfHostedState,
} from './state';

const GlobalProvider: React.FC = ({ children }) => {
  const setEmail = useSetRecoilState(adminEmailState);
  const setLicenced = useSetRecoilState(isLicencedState);
  const setSelfHosted = useSetRecoilState(selfHostedState);
  const setOAuth = useSetRecoilState(oauthAvailabilitiesState);

  useEffect(() => {
    async function loadGlobal() {
      const infos = await fetchSelfHostingInfo();
      console.log('infos: ', infos);
      if (infos) {
        setEmail(infos.adminEmail);
        setLicenced(infos.licenced);
        setSelfHosted(infos.selfHosted);
        setOAuth(infos.oAuth);
      }
    }
    loadGlobal();
  }, [setEmail, setLicenced, setSelfHosted, setOAuth]);

  return <>{children}</>;
};

export default GlobalProvider;
