import { fetchPatch, fetchPost } from '../../api/fetch';
import {
  AdminChangePasswordPayload,
  FullUser,
  MergeUsersPayload,
} from 'common';

export async function changePassword(userId: string, password: string) {
  return await fetchPatch<AdminChangePasswordPayload>('/api/admin/user', {
    userId,
    password,
  });
}

export async function mergeUsers(main: FullUser, merged: FullUser[]) {
  return await fetchPost<MergeUsersPayload>('/api/admin/merge', {
    main: main.identityId,
    merged: merged.map((u) => u.identityId),
  });
}
