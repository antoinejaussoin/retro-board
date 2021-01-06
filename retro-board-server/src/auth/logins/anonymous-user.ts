import { UserEntity } from '../../db/entities';
import { v4 } from 'uuid';
import { getUserByUsername, getOrSaveUser } from '../../db/actions/users';

export default async function loginAnonymous(
  username: string
): Promise<UserEntity> {
  const actualUsername = username.split('^')[0];
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return existingUser;
  }
  const user = new UserEntity(v4(), actualUsername);
  user.username = username;
  user.language = 'en';

  const dbUser = await getOrSaveUser(user);
  return dbUser;
}
