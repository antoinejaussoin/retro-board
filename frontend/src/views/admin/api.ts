import { fetchPatch } from '../../api/fetch';
import { AdminChangePasswordPayload } from '@retrospected/common';

export async function changePassword(userId: string, password: string) {
  return await fetchPatch<AdminChangePasswordPayload>('/api/admin/user', {
    userId,
    password,
  });
}
