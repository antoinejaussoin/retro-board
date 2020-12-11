import { Request } from 'express';
import { genSalt, hash } from 'bcryptjs';
import { UserView, UserEntity } from './db/entities';
import { Connection } from 'typeorm';
import { getUserView, getUser } from './db/actions/users';

export async function getUserViewFromRequest(
  connection: Connection,
  request: Request
): Promise<UserView | null> {
  if (request.user) {
    const user = await getUserView(connection, request.user);
    return user;
  }
  return null;
}

export async function getUserFromRequest(
  connection: Connection,
  request: Request
): Promise<UserEntity | null> {
  if (request.user) {
    const user = await getUser(connection, request.user);
    return user;
  }
  return null;
}

export async function hashPassword(clearTextPassword: string): Promise<string> {
  const salt = await genSalt();
  const hashedPassword = await hash(clearTextPassword, salt);
  return hashedPassword;
}
