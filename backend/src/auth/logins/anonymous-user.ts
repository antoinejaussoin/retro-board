import { UserIdentityEntity } from '../../db/entities';
import { registerAnonymousUser } from '../../db/actions/users';

export default async function loginAnonymous(
  username: string,
  password: string
): Promise<UserIdentityEntity | null> {
  const identity = registerAnonymousUser(username, password);
  return identity;
  // const actualUsername = username.split('^')[0];
  // const existingIdentity = await getPasswordIdentity(username);

  // if (!existingIdentity) {
  //   const hashedPassword = await hashPassword(password);
  //   const user = new UserEntity(v4(), actualUsername);
  //   // const
  //   user.username = username;
  //   user.language = 'en';

  //   const dbUser = await getOrSaveUser(user);
  //   return dbUser;
  // }

  // if (!existingIdentity.password) {
  //   const hashedPassword = await hashPassword(password);
  //   const dbUser = await updateUserPassword(existingIdentity.id, hashedPassword);
  //   return dbUser;
  // }

  // const isPasswordCorrect = await compare(password, existingIdentity.password);

  // return isPasswordCorrect ? existingIdentity : null;
}
