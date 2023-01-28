import useUser from '../../../auth/useUser';
import useCanDecrypt from '../../../crypto/useCanDecrypt';
import useIsDisabled from '../../../hooks/useIsDisabled';
import useSession from '../useSession';
import { useShouldLockSession } from '../useTimer';
import {
  sessionPermissionLogic,
  SessionUserPermissions,
} from './permissions-logic';

export default function useSessionUserPermissions(): SessionUserPermissions {
  const { session } = useSession();
  const user = useUser();
  const canDecrypt = useCanDecrypt();
  const isDisabled = useIsDisabled();
  const shouldLockSession = useShouldLockSession();
  return sessionPermissionLogic(
    session,
    user,
    canDecrypt,
    isDisabled || shouldLockSession
  );
}
