import useIsLicenced from '../global/useIsLicenced';
import useIsSelfHosted from '../global/useIsSelfHosted';
import useUser from './useUser';

export default function useIsPro() {
  const user = useUser();
  const isSelfHosted = useIsSelfHosted();
  const isLicenced = useIsLicenced();
  if (isSelfHosted && isLicenced) {
    return true;
  }
  const activeTrial = user && user.trial && new Date(user.trial) > new Date();
  return user && (user.pro || activeTrial);
}
