import { UserEntity, UserView } from '../entities';
import { EntityManager } from 'typeorm';
import { UserIdentityRepository, UserRepository } from '../repositories';
import { ALL_FIELDS } from '../entities/User';
import { ALL_FIELDS as ALL_FIELDS_IDENTITY } from '../entities/UserIdentity';
import { transaction } from './transaction';
import { AccountType, FullUser } from '../../common';
import { isSelfHostedAndLicenced } from '../../security/is-licenced';
import { v4 } from 'uuid';
import UserIdentityEntity from '../entities/UserIdentity';
import { comparePassword, hashPassword } from '../../utils';

export async function getUser(userId: string): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    return getUserInner(manager, userId);
  });
}

export async function getIdentity(
  identityId: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    return getIdentityInner(manager, identityId);
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
  userId: string
): Promise<UserEntity | null> {
  const userRepository = manager.getCustomRepository(UserRepository);
  const user = await userRepository.findOne(userId, { select: ALL_FIELDS });
  return user || null;
}

async function getIdentityInner(
  manager: EntityManager,
  identityId: string
): Promise<UserIdentityEntity | null> {
  const identityRepository = manager.getCustomRepository(
    UserIdentityRepository
  );
  const user = await identityRepository.findOne(identityId, {
    select: ALL_FIELDS_IDENTITY,
  });
  return user || null;
}

export async function getUserView(
  identityId: string
): Promise<UserView | null> {
  return await transaction(async (manager) => {
    return getUserViewInner(manager, identityId);
  });
}

export async function getUserViewInner(
  manager: EntityManager,
  identityId: string
): Promise<UserView | null> {
  const userViewRepository = manager.getRepository(UserView);
  const user = await userViewRepository.findOne({ identityId });
  // All users are pro if self-hosted and licenced
  if (user && isSelfHostedAndLicenced()) {
    user.pro = true;
  }
  return user || null;
}

export async function getPasswordIdentity(
  username: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );
    const identity = await identityRepository.findOne({
      username,
      accountType: 'password',
    });
    return identity || null;
  });
}

export async function getPasswordIdentityByUserId(
  userId: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );
    const identity = await identityRepository.findOne({
      user: { id: userId },
      accountType: 'password',
    });
    return identity || null;
  });
}

export async function getUserByUsername(
  username: string
): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );
    const identity = await identityRepository.findOne({ username });
    return identity ? identity.user : null;
  });
}

export async function updateIdentity(
  identityId: string,
  updatedIdentity: Partial<UserIdentityEntity>
): Promise<UserView | null> {
  return await transaction(async (manager) => {
    try {
      const identityRepository = manager.getCustomRepository(
        UserIdentityRepository
      );
      await identityRepository.update(identityId, updatedIdentity);
      const newUser = await getUserViewInner(manager, identityId);
      return newUser || null;
    } catch (err) {
      console.error('Error :', err);
      return null;
    }
  });
}

export async function updateUser(
  userId: string,
  updatedUser: Partial<UserEntity>
): Promise<boolean> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const user = await getUserInner(manager, userId);
    if (user) {
      const result = await userRepository.update(userId, updatedUser);
      return !!result.affected;
    }
    return false;
  });
}

export async function getIdentityByUsername(
  accountType: AccountType,
  username: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    const repo = manager.getCustomRepository(UserIdentityRepository);
    const identity = await repo.findOne({
      where: { accountType, username },
    });
    if (identity) {
      return identity;
    }
    return null;
  });
}

export type UserRegistration = {
  type: AccountType;
  name: string;
  username: string;
  email: string;
  password?: string;
  emailVerification?: string;
  language?: string;
  photo?: string;
  slackUserId?: string;
  slackTeamId?: string;
};

export async function registerUser(
  registration: UserRegistration
): Promise<UserIdentityEntity> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );

    const [identity, existing] = await getOrCreateIdentity(
      manager,
      registration.username,
      registration.email,
      registration.type
    );
    const user = identity.user;

    identity.username = registration.username;
    identity.accountType = registration.type;
    identity.photo = registration.photo || null;
    identity.password = registration.password || null;
    identity.emailVerification = registration.emailVerification || null;

    user.name = user.name || registration.name;
    user.slackUserId = registration.slackUserId || null;
    user.slackTeamId = registration.slackTeamId || null;
    user.photo = registration.photo || user.photo;
    user.email = registration.email;

    if (!existing && registration.language) {
      user.language = registration.language;
    }

    await userRepository.save(user);
    await identityRepository.save(identity);

    return identity;
  });
}

export async function registerAnonymousUser(
  username: string,
  password: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );

    const actualUsername = username.split('^')[0];
    const existingIdentity = await identityRepository.findOne({
      username,
      accountType: 'anonymous',
    });

    if (!existingIdentity) {
      const hashedPassword = await hashPassword(password);
      const user = new UserEntity(v4(), actualUsername);
      const identity = new UserIdentityEntity(v4(), user, hashedPassword);

      identity.username = username;

      await userRepository.save(user);
      await identityRepository.save(identity);
      return identity;
    }

    if (!existingIdentity.password) {
      const hashedPassword = await hashPassword(password);
      const dbUser = await updateUserPassword(
        manager,
        existingIdentity.id,
        hashedPassword
      );
      return dbUser;
    }

    const isPasswordCorrect = await comparePassword(
      password,
      existingIdentity.password
    );

    return isPasswordCorrect ? existingIdentity : null;
  });
}

async function getOrCreateIdentity(
  manager: EntityManager,
  username: string,
  email: string,
  accountType: AccountType
): Promise<[identity: UserIdentityEntity, existing: boolean]> {
  const identityRepository = manager.getCustomRepository(
    UserIdentityRepository
  );
  const identities = await identityRepository.find({
    where: { username, accountType },
  });

  if (identities.length) {
    // In certain conditions, the user attached to the identity could be wrong if the user didn't have an email
    const identity = identities[0];
    if (identity.user.email !== email) {
      const [user, existing] = await getOrCreateUser(manager, email);
      identity.user = user;
      return [identity, existing];
    }

    return [identity, true];
  }

  const [user, existing] = await getOrCreateUser(manager, email);
  const identity = new UserIdentityEntity(v4(), user);

  return [identity, existing];
}

async function getOrCreateUser(
  manager: EntityManager,
  email: string
): Promise<[identity: UserEntity, existing: boolean]> {
  const userRepository = manager.getCustomRepository(UserRepository);
  const existingUser = await userRepository.findOne({
    where: { email },
  });
  if (existingUser) {
    return [existingUser, true];
  }
  const user = new UserEntity(v4(), '');
  user.email = email;
  const savedUser = await userRepository.saveAndReload(user);

  return [savedUser, false];
}

async function updateUserPassword(
  manager: EntityManager,
  identityId: string,
  password: string
): Promise<UserIdentityEntity | null> {
  const identityRepo = manager.getCustomRepository(UserIdentityRepository);
  const existingUser = await identityRepo.findOne(identityId);
  if (existingUser) {
    return await identityRepo.saveAndReload({
      ...existingUser,
      password,
    });
  }
  return null;
}

export function isUserPro(user: FullUser) {
  // TODO: deduplicate from same logic in Frontend frontend/src/auth/useIsPro.ts
  if (isSelfHostedAndLicenced()) {
    return true;
  }
  const activeTrial = user && user.trial && new Date(user.trial) > new Date();
  return user && (user.pro || activeTrial);
}
