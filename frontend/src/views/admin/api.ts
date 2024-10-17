import type {
  AdminChangePasswordPayload,
  AdminStats,
  FullUser,
  MergeUsersPayload,
} from 'common';
import { fetchGet, fetchPatch, fetchPost } from '../../api/fetch';

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

export async function fetchAdminStats() {
  return await fetchGet<AdminStats>('/api/admin/stats', { clients: 0 });
}
