import { Request } from 'express';
import { User } from 'retro-board-common';
import { Store } from './types';

export async function getUser(
  store: Store,
  request: Request
): Promise<User | null> {
  if (request.user) {
    const user = await store.getUser(request.user);
    return user;
  }
  return null;
}
