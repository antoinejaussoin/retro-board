import { UserIdentityEntity } from '../../db/entities';
import { registerAnonymousUser } from '../../db/actions/users';

export default async function loginAnonymous(
  username: string,
  password: string
): Promise<UserIdentityEntity | null> {
  const identity = await registerAnonymousUser(username, password);
  return identity;
}
