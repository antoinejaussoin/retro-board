import useBackendCapabilities from '../global/useBackendCapabilities';
import useUser from './useUser';

export default function useIsPro() {
  const user = useUser();
  const backend = useBackendCapabilities();
  if (backend.selfHosted && backend.licenced) {
    return true;
  }
  const activeTrial = user && user.trial && new Date(user.trial) > new Date();
  return user && (user.pro || activeTrial);
}
