import useGlobalState from '../../state';
import { Post } from 'retro-board-common';
import { permissionLogic, UserPermissions } from './permissions-logic';
import useUser from '../../auth/useUser';

export function useUserPermissions(post: Post): UserPermissions {
  const { state } = useGlobalState();
  const user = useUser();
  return permissionLogic(post, state.session, user);
}
