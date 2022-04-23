import { RegisterPayload } from '../../common';
import { v4 } from 'uuid';
import { hashPassword } from '../../utils';
import { UserIdentityEntity } from '../../db/entities';
import { getIdentityByUsername, registerUser } from '../../db/actions/users';
import { canSendEmails } from '../../email/utils';

export default async function registerPasswordUser(
  details: RegisterPayload,
  skipValidation = false
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
    emailVerification: !skipValidation && canSendEmails() ? v4() : undefined,
    language: details.language,
  });

  return identity;
}
