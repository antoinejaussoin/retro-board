import { UserEntity, UserView } from '../entities';
import { Connection } from 'typeorm';
import { UserRepository } from '../repositories';
import { ALL_FIELDS } from '../entities/User';

export async function getUser(
  connection: Connection,
  id: string
): Promise<UserEntity | null> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const user = await userRepository.findOne(id, { select: ALL_FIELDS });
  return user || null;
}

export async function getUserView(
  connection: Connection,
  id: string
): Promise<UserView | null> {
  const userViewRepository = connection.getRepository(UserView);
  const user = await userViewRepository.findOne({ id });
  return user || null;
}

export async function getUserByUsername(
  connection: Connection,
  username: string
): Promise<UserEntity | null> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const user = await userRepository.findOne(
    { username },
    { select: ALL_FIELDS }
  );
  return user || null;
}

export async function updateUser(
  connection: Connection,
  id: string,
  updatedUser: Partial<UserEntity>
): Promise<UserView | null> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const user = await getUser(connection, id);
  if (user) {
    await userRepository.update(id, updatedUser);
    const newUser = await getUserView(connection, id);
    return newUser || null;
  }
  return null;
}

export async function getOrSaveUser(
  connection: Connection,
  user: UserEntity
): Promise<UserEntity> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const existingUser = await userRepository.findOne({
    where: { username: user.username, accountType: user.accountType },
  });
  if (existingUser) {
    return await userRepository.save({
      ...existingUser,
      email: user.email,
      photo: user.photo,
    });
  }
  return await userRepository.save(user);
}
