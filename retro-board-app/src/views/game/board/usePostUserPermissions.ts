import { Post } from '@retrospected/common';
import { postPermissionLogic, PostUserPermissions } from './permissions-logic';
import useUser from '../../../auth/useUser';
import useSession from '../useSession';

export function usePostUserPermissions(post: Post): PostUserPermissions {
  const { session } = useSession();
  const user = useUser();
  return postPermissionLogic(post, session, user);
}
