import { UserEntity } from '../../db/entities';
import { v4 } from 'uuid';
import {
  getUserByUsername,
  getOrSaveUser,
  updateUserPassword,
} from '../../db/actions/users';
import { hashPassword } from '../../utils';
import { compare } from 'bcryptjs';

export default async function loginAnonymous(
  username: string,
  password: string
): Promise<UserEntity | null> {
  const actualUsername = username.split('^')[0];
  const existingUser = await getUserByUsername(username);
  if (!existingUser) {
    const hashedPassword = await hashPassword(password);
    const user = new UserEntity(v4(), actualUsername, hashedPassword);
    user.username = username;
    user.language = 'en';

    const dbUser = await getOrSaveUser(user);
    return dbUser;
  }

  if (!existingUser.password) {
    const hashedPassword = await hashPassword(password);
    const dbUser = await updateUserPassword(existingUser.id, hashedPassword);
    return dbUser;
  }

  const isPasswordCorrect = await compare(password, existingUser.password);

  return isPasswordCorrect ? existingUser : null;
}
