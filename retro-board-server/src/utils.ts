import { Request } from 'express';
import { genSalt, hash } from 'bcryptjs';
import { UserView, UserEntity } from './db/entities';
import { getUserView, getUser } from './db/actions/users';

export async function getUserViewFromRequest(
  request: Request
): Promise<UserView | null> {
  if (request.user) {
    const user = await getUserView(request.user);
    return user;
  }
  return null;
}

export async function getUserFromRequest(
  request: Request
): Promise<UserEntity | null> {
  if (request.user) {
    const user = await getUser(request.user);
    return user;
  }
  return null;
}

export async function hashPassword(clearTextPassword: string): Promise<string> {
  const salt = await genSalt();
  const hashedPassword = await hash(clearTextPassword, salt);
  return hashedPassword;
}
