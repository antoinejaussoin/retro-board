import { v4 } from 'uuid';
import type { RegisterPayload } from '../../common/index.js';
import { getIdentityByUsername, registerUser } from '../../db/actions/users.js';
import type { UserIdentityEntity } from '../../db/entities/index.js';
import { canSendEmails } from '../../email/utils.js';
import { hashPassword } from '../../encryption.js';

export default async function registerPasswordUser(
  details: RegisterPayload,
  skipValidation = false,
): Promise<UserIdentityEntity | null> {
  const existingIdentity = await getIdentityByUsername(
    'password',
    details.username,
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
