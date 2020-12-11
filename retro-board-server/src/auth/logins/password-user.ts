import { compare } from 'bcryptjs';
import { UserEntity } from '../../db/entities';
import { Connection } from 'typeorm';
import { getUserByUsername } from '../../db/actions/users';

export default async function loginUser(
  connection: Connection,
  username: string,
  password: string
): Promise<UserEntity | null> {
  const user = await getUserByUsername(connection, username);
  if (!user || user.password === null) {
    return null;
  }
  const isPasswordCorrect = await compare(password, user.password);
  return isPasswordCorrect ? user : null;
}
