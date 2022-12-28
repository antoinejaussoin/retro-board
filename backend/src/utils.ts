import { Request } from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto-js';
import { UserView, UserIdentityEntity } from './db/entities/index.js';
import { getUserView, getUser, getIdentity } from './db/actions/users.js';
import { Quota } from './common/index.js';
import { getNumberOfPosts } from './db/actions/posts.js';

const aes = crypto.AES;
const stringify = crypto.enc.Utf8.stringify;
const { compare, genSalt, hash } = bcryptjs;

export async function getUserViewFromRequest(
  request: Request
): Promise<UserView | null> {
  if (request.user) {
    const userView = await getUserView(
      (request.user as unknown as UserIds).identityId
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
  request: Request
): Promise<UserIdentityEntity | null> {
  if (request.user) {
    const ids = request.user;
    const identity = await getIdentity(ids.identityId);
    return identity;
  }
  return null;
}

export async function hashPassword(clearTextPassword: string): Promise<string> {
  const salt = await genSalt();
  const hashedPassword = await hash(clearTextPassword, salt);
  return hashedPassword;
}

export async function comparePassword(
  clearTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const match = await compare(clearTextPassword, hashedPassword);
  return match;
}

export function encrypt(clear: string, key: string): string {
  const encrypted = aes.encrypt(clear, key).toString();
  return encrypted;
}

export function decrypt(encrypted: string, key: string): string {
  const bytes = aes.decrypt(encrypted, key);
  const clear = stringify(bytes);
  return clear;
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
