import { RegisterPayload } from '@retrospected/common';
import { v4 } from 'uuid';
import { hashPassword } from '../../utils';
import UserEntity from '../../db/entities/User';
import { getUserByUsername, getOrSaveUser } from '../../db/actions/users';
import { Connection } from 'typeorm';

export default async function registerUser(
  connection: Connection,
  details: RegisterPayload
): Promise<UserEntity | null> {
  const existingUser = await getUserByUsername(connection, details.username);
  if (existingUser) {
    return null;
  }
  const hashedPassword = await hashPassword(details.password);
  const newUser = new UserEntity(v4(), details.name, hashedPassword);
  newUser.language = details.language;
  newUser.username = details.username;
  newUser.email = details.username;
  newUser.emailVerification = v4();
  newUser.accountType = 'password';

  const persistedUser = await getOrSaveUser(connection, newUser);
  return persistedUser;
}
