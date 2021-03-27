import { Request } from 'express';
import { genSalt, hash } from 'bcryptjs';
import { UserView, UserEntity } from './db/entities';
import { getUserView, getUser } from './db/actions/users';
import { Quota } from '@retrospected/common';
import { getNumberOfPosts } from './db/actions/posts';

export async function getUserViewFromRequest(
  request: Request
): Promise<UserView | null> {
  if (request.user) {
    const user = await getUserView(request.user);
    return user;
  }
  return null;
}

export async function getUserQuota(request: Request): Promise<Quota | null> {
  if (request.user) {
    const user = await getUser(request.user);
    const posts = await getNumberOfPosts(request.user);
    if (user) {
      return {
        posts,
        quota: user.quota,
      };
    }
    return {
      posts,
      quota: 50,
    };
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

export default async function wait(delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
