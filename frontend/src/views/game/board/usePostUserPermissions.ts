import { Post } from 'common';
import { postPermissionLogic, PostUserPermissions } from './permissions-logic';
import useUser from '../../../auth/useUser';
import useSession from '../useSession';

export function usePostUserPermissions(post: Post): PostUserPermissions {
  const { session } = useSession();
  const user = useUser();
  return postPermissionLogic(post, session, user);
}

export function usePostUserPermissionsNullable(
  post?: Post
): PostUserPermissions | undefined {
  const { session } = useSession();
  const user = useUser();
  if (!post) {
    return undefined;
  }

  return postPermissionLogic(post, session, user);
}
