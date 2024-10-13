import useUser from '../state/user/useUser';

export default function useIsTrial() {
  const user = useUser();
  const activeTrial = !!(user?.trial && new Date(user.trial) > new Date());
  return activeTrial && user && !user.pro;
}
