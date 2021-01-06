import { compare } from 'bcryptjs';
import { UserEntity } from '../../db/entities';
import { getUserByUsername } from '../../db/actions/users';

export default async function loginUser(
  username: string,
  password: string
): Promise<UserEntity | null> {
  const user = await getUserByUsername(username);
  if (!user || user.password === null) {
    return null;
  }
  const isPasswordCorrect = await compare(password, user.password);
  return isPasswordCorrect ? user : null;
}
