import { Store } from "src/types";
import { User as UserEntity } from "src/db/entities";
import { User } from 'retro-board-common';
import { v4 } from "uuid";

export default async function loginAnonymous(store: Store, username: string): Promise<User> {
  const actualUsername = username.split('^')[0];
  const existingUser = await store.getUserByUsername(username);
  if (existingUser) {
    return existingUser;
  }
  const user: User = {
    accountType: 'anonymous',
    id: v4(),
    name: actualUsername,
    photo: null,
    username: username,
    password: null,
    language: 'en',
    emailVerification: null,
  };
  const dbUser = await store.getOrSaveUser(user);
  return dbUser;
}