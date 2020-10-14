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
  const newUser = new UserEntity(v4(), details.name, hashedPassword);
  const persistedUser = await store.getOrSaveUser(newUser);
  return persistedUser;
}