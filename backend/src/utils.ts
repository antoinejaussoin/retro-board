import type { Request } from 'express';
import type { UserView, UserIdentityEntity } from './db/entities/index.js';
import { getUserView, getUser, getIdentity } from './db/actions/users.js';
import type { Quota } from './common/index.js';
import { getNumberOfPosts } from './db/actions/posts.js';

export async function getUserViewFromRequest(
  request: Request,
): Promise<UserView | null> {
  if (request.user) {
    const userView = await getUserView(
      (request.user as unknown as UserIds).identityId,
    );
    return userView;
  }
  return null;
}

export async function getUserQuota(request: Request): Promise<Quota | null> {
  if (request.user) {
    const ids = request.user;
    const user = await getUser(ids.userId);
    const posts = await getNumberOfPosts(ids.userId);
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

export async function getIdentityFromRequest(
  request: Request,
): Promise<UserIdentityEntity | null> {
  if (request.user) {
    const ids = request.user;
    const identity = await getIdentity(ids.identityId);
    return identity;
  }
  return null;
}

export default async function wait(delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export type UserIds = {
  userId: string;
  identityId: string;
};

export function serialiseIds(ids: UserIds): string {
  return `${ids.userId}:${ids.identityId}`;
}

export function deserialiseIds(ids: string): UserIds {
  return { userId: ids.split(':')[0], identityId: ids.split(':')[1] };
}
