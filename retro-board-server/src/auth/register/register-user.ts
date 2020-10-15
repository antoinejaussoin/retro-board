import { RegisterPayload, User } from "retro-board-common";
import { Store } from "../../types";
import { User as UserEntity } from "../../db/entities";
import { v4 } from "uuid";
import { genSalt, hash } from 'bcrypt';


export default async function registerUser(store: Store, details: RegisterPayload): Promise<User | null> {
  const existingUser = await store.getUserByUsername(details.username);
  if (existingUser) {
    return null;
  }
  const salt = await genSalt();
  const hashedPassword = await hash(details.password, salt);
  const newUser: User = {
    accountType: 'password',
    id: v4(),
    name: details.name,
    photo: null,
    language: 'en',
    username: details.username,
    password: hashedPassword,
    emailVerification: v4(),
  };
  const persistedUser = await store.getOrSaveUser(newUser);
  return persistedUser;
}