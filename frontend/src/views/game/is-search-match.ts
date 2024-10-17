import type { Post } from 'common';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { useCallback } from 'react';
import useUser from 'state/user/useUser';
import { postPermissionLogic } from './board/permissions-logic';
import useSession from './useSession';

type SearchPredicate = (post: Post) => boolean;

function match(value: string, search: string) {
  return value.toLocaleLowerCase().includes(search.toLocaleLowerCase());
}

export function searchLogic(
  content: string,
  user: string | null,
  search: string,
  blurred: boolean,
) {
  if (!search) {
    return true;
  }
  if (blurred) {
    return false;
  }
  return match(content, search) || match(user || '', search);
}

export function useSearch(search: string): SearchPredicate {
  const capabilities = useBackendCapabilities();
  const user = useUser();
  const { session } = useSession();

  const predicate = useCallback(
    (post: Post) => {
      if (!search) {
        return true;
      }
      const permissions = postPermissionLogic(
        post,
        session,
        capabilities,
        user,
        false,
      );
      return searchLogic(
        post.content,
        post.user.name,
        search,
        permissions.isBlurred,
      );
    },
    [capabilities, user, session, search],
  );

  return predicate;
}
