import { RegisterPayload } from '@retrospected/common';
import { v4 } from 'uuid';
import { hashPassword } from '../../utils';
import { UserIdentityEntity } from '../../db/entities';
import { getIdentityByUsername, registerUser } from '../../db/actions/users';
import config from '../../config';

export default async function registerPasswordUser(
  details: RegisterPayload
): Promise<UserIdentityEntity | null> {
  const existingIdentity = await getIdentityByUsername(
    'password',
    details.username
  );
  if (existingIdentity) {
    return null;
  }
  const hashedPassword = await hashPassword(details.password);

  const identity = await registerUser({
    email: details.username,
    name: details.name,
    type: 'password',
    username: details.username,
    password: hashedPassword,
    emailVerification: config.SELF_HOSTED ? v4() : undefined,
    language: details.language,
  });

  // const user = await getOrCreateUser(details.username);
  // const identity = new UserIdentityEntity(v4(), user, hashedPassword);
  // identity.username = details.username;
  // user.name = details.name;
  // user.language = details.language;
  // user.email = details.username;
  // // If self-hosted we skip the requirement for email checks
  // if (!config.SELF_HOSTED) {
  //   identity.emailVerification = v4();
  // }
  // identity.accountType = 'password';

  // const persistedUser = await getOrSaveUser(user);
  return identity;
}
