import type { UserIdentityEntity } from '../../db/entities/index.js';
import { getIdentityByUsername } from '../../db/actions/users.js';
import { comparePassword } from '../../encryption.js';

export default async function loginUser(
  username: string,
  password: string,
): Promise<UserIdentityEntity | null> {
  const user = await getIdentityByUsername('password', username);
  if (!user || user.password === null) {
    return null;
  }
  const isPasswordCorrect = await comparePassword(password, user.password);
  return isPasswordCorrect ? user : null;
}
