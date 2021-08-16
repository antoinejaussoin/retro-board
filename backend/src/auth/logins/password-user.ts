import { compare } from 'bcryptjs';
import { UserIdentityEntity } from '../../db/entities';
import { getIdentityByUsername } from '../../db/actions/users';

export default async function loginUser(
  username: string,
  password: string
): Promise<UserIdentityEntity | null> {
  const user = await getIdentityByUsername('password', username);
  if (!user || user.password === null) {
    return null;
  }
  const isPasswordCorrect = await compare(password, user.password);
  return isPasswordCorrect ? user : null;
}
