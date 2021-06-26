import { RegisterPayload } from '@retrospected/common';
import { v4 } from 'uuid';
import { hashPassword } from '../../utils';
import UserEntity from '../../db/entities/User';
import { getUserByUsername, getOrSaveUser } from '../../db/actions/users';
import config from '../../config';

export default async function registerUser(
  details: RegisterPayload
): Promise<UserEntity | null> {
  const existingUser = await getUserByUsername(details.username);
  if (existingUser) {
    return null;
  }
  const hashedPassword = await hashPassword(details.password);
  const newUser = new UserEntity(v4(), details.name, hashedPassword);
  newUser.language = details.language;
  newUser.username = details.username;
  newUser.email = details.username;
  // If self-hosted we skip the requirement for email checks
  if (!config.SELF_HOSTED) {
    newUser.emailVerification = v4();
  }
  newUser.accountType = 'password';

  const persistedUser = await getOrSaveUser(newUser);
  return persistedUser;
}
