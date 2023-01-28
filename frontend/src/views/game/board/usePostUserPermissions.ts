import { Post } from 'common';
import { postPermissionLogic, PostUserPermissions } from './permissions-logic';
import useUser from '../../../auth/useUser';
import useSession from '../useSession';
import { useShouldLockSession } from '../useTimer';

export function usePostUserPermissions(post: Post): PostUserPermissions {
  const { session } = useSession();
  const user = useUser();
  const readonly = useShouldLockSession();
  return postPermissionLogic(post, session, user, readonly);
}

export function usePostUserPermissionsNullable(
  post?: Post
): PostUserPermissions | undefined {
  const { session } = useSession();
  const readonly = useShouldLockSession();
  const user = useUser();
  if (!post) {
    return undefined;
  }

  return postPermissionLogic(post, session, user, readonly);
}
