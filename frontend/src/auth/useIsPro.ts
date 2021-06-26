import getConfig from '../utils/getConfig';
import useUser from './useUser';

export default function useIsPro() {
  const user = useUser();
  const selfHosted = getConfig.selfHosted;
  if (selfHosted) {
    return true;
  }
  const activeTrial = user && user.trial && new Date(user.trial) > new Date();
  return user && (user.pro || activeTrial);
}
