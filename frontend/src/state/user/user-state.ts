import { me } from 'api';
import type { FullUser } from 'common';
import { queryKeys } from '../queryKeys';

export { queryKeys };

export async function fetchCurrentUser(): Promise<FullUser | null> {
  return me();
}
