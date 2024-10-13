import { fetchGet } from 'api/fetch';
import type { User } from 'common';

export async function fetchUsers() {
  return await fetchGet<User[]>('/api/users', []);
}
