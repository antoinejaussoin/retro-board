import { UserEntity, UserView } from '../entities';
import { EntityManager } from 'typeorm';
import { UserRepository } from '../repositories';
import { ALL_FIELDS } from '../entities/User';
import { transaction } from './transaction';
import { FullUser } from '@retrospected/common';
import { isSelfHostedAndLicenced } from '../../security/is-licenced';

export async function getUser(id: string): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    return getUserInner(manager, id);
  });
}

export async function getAllPasswordUsers(): Promise<UserView[]> {
  return await transaction(async (manager) => {
    const userRepository = manager.getRepository(UserView);
    const users = await userRepository.find({
      where: { accountType: 'password' },
    });
    return users;
  });
}

async function getUserInner(
  manager: EntityManager,
  id: string
): Promise<UserEntity | null> {
  const userRepository = manager.getCustomRepository(UserRepository);
  const user = await userRepository.findOne(id, { select: ALL_FIELDS });
  return user || null;
}

export async function getUserView(id: string): Promise<UserView | null> {
  return await transaction(async (manager) => {
    return getUserViewInner(manager, id);
  });
}

export async function getUserViewInner(
  manager: EntityManager,
  id: string
): Promise<UserView | null> {
  const userViewRepository = manager.getRepository(UserView);
  const user = await userViewRepository.findOne({ id });
  // All users are pro if self-hosted and licenced
  if (user && isSelfHostedAndLicenced()) {
    user.pro = true;
  }
  return user || null;
}

export async function getUserByUsername(
  username: string
): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const user = await userRepository.findOne(
      { username },
      { select: ALL_FIELDS }
    );
    return user || null;
  });
}

export async function updateUser(
  id: string,
  updatedUser: Partial<UserEntity>
): Promise<UserView | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const user = await getUserInner(manager, id);
    if (user) {
      await userRepository.update(id, updatedUser);
      const newUser = await getUserViewInner(manager, id);
      return newUser || null;
    }
    return null;
  });
}

export async function getOrSaveUser(user: UserEntity): Promise<UserEntity> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
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
  });
}

export async function updateUserPassword(
  id: string,
  password: string
): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const existingUser = await userRepository.findOne({
      where: { id },
    });
    if (existingUser) {
      return await userRepository.save({
        ...existingUser,
        password,
      });
    }
    return null;
  });
}

export function isUserPro(user: FullUser) {
  // TODO: deduplicate from same logic in Frontend frontend/src/auth/useIsPro.ts
  if (isSelfHostedAndLicenced()) {
    return true;
  }
  const activeTrial = user && user.trial && new Date(user.trial) > new Date();
  return user && (user.pro || activeTrial);
}
