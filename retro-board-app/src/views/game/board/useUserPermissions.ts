import { Post } from '@retrospected/common';
import { permissionLogic, UserPermissions } from './permissions-logic';
import useUser from '../../../auth/useUser';
import useSession from '../useSession';

export function useUserPermissions(post: Post): UserPermissions {
  const { session } = useSession();
  const user = useUser();
  return permissionLogic(post, session, user);
}
