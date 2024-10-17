import { registerAnonymousUser } from '../../db/actions/users.js';
import type { UserIdentityEntity } from '../../db/entities/index.js';

export default async function loginAnonymous(
  username: string,
  password: string,
): Promise<UserIdentityEntity | null> {
  const identity = await registerAnonymousUser(username, password);
  return identity;
}
