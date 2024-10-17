import type { Post } from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import useUser from '../../../state/user/useUser';
import useSession from '../useSession';
import { useShouldLockSession } from '../useTimer';
import {
  type PostUserPermissions,
  postPermissionLogic,
} from './permissions-logic';

export function usePostUserPermissions(post: Post): PostUserPermissions {
  const { session } = useSession();
  const user = useUser();
  const readonly = useShouldLockSession();
  const capabilities = useBackendCapabilities();
  return postPermissionLogic(post, session, capabilities, user, readonly);
}

export function usePostUserPermissionsNullable(
  post?: Post,
): PostUserPermissions | undefined {
  const { session } = useSession();
  const readonly = useShouldLockSession();
  const user = useUser();
  const capabilities = useBackendCapabilities();
  if (!post) {
    return undefined;
  }

  return postPermissionLogic(post, session, capabilities, user, readonly);
}
