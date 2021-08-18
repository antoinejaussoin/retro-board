import { UserEntity, UserView } from '../entities';
import { EntityManager } from 'typeorm';
import { UserIdentityRepository, UserRepository } from '../repositories';
import { ALL_FIELDS } from '../entities/User';
import { ALL_FIELDS as ALL_FIELDS_IDENTITY } from '../entities/UserIdentity';
import { transaction } from './transaction';
import { AccountType, FullUser } from '@retrospected/common';
import { isSelfHostedAndLicenced } from '../../security/is-licenced';
import { v4 } from 'uuid';
import UserIdentityEntity from '../entities/UserIdentity';
import { hashPassword } from '../../utils';
import { compare } from 'bcryptjs';

export async function getUser(id: string): Promise<UserEntity | null> {
  return await transaction(async (manager) => {
    return getUserInner(manager, id);
  });
}

export async function getIdentity(
  id: string
): Promise<UserIdentityEntity | null> {
  return await transaction(async (manager) => {
    return getIdentityInner(manager, id);
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

async function getIdentityInner(
  manager: EntityManager,
  id: string
): Promise<UserIdentityEntity | null> {
  const identityRepository = manager.getCustomRepository(
    UserIdentityRepository
  );
  const user = await identityRepository.findOne(id, {
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
    const identity = await identityRepository.findOne(
      { username, accountType: 'password' }
      // { select }
    );
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
    const identity = await identityRepository.findOne(
      { user: { id: userId }, accountType: 'password' }
      // { select }
    );
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
    const identity = await identityRepository.findOne(
      { username }
      // { select }
    );
    return identity ? identity.user : null;
  });
}

export async function updateIdentity(
  id: string,
  updatedIdentity: Partial<UserIdentityEntity>
): Promise<UserView | null> {
  return await transaction(async (manager) => {
    const identityRepository = manager.getCustomRepository(
      UserIdentityRepository
    );
    await identityRepository.update(id, updatedIdentity);
    const identity = await identityRepository.findOne(id);
    if (identity) {
      const newUser = await getUserViewInner(manager, identity.user.id);
      return newUser || null;
    }
    return null;
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

// export async function saveIdentity(identity: UserIdentityEntity) {

// }

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

    const identity = await getOrCreateIdentity(
      manager,
      registration.username,
      registration.type
    );
    const user = identity.user;

    identity.username = registration.username;
    identity.accountType = registration.type;
    identity.photo = registration.photo || null;
    identity.password = registration.password || null;
    identity.emailVerification = registration.emailVerification || null;

    user.name = registration.name;
    user.slackUserId = registration.slackUserId || null;
    user.slackTeamId = registration.slackTeamId || null;
    user.photo = registration.photo || user.photo;

    if (registration.language) {
      user.language = registration.language;
    }

    await userRepository.save(user);
    await identityRepository.save(identity);

    return identity;
    // const userRepository = manager.getCustomRepository(UserRepository);
    // const identityRepository = manager.getCustomRepository(
    //   UserIdentityRepository
    // );
    // const user = await getOrCreateUser(manager, registration.username);
    // const identity = new UserIdentityEntity(v4(), user, registration.password);
    // identity.username = registration.username;
    // identity.accountType = registration.type;
    // identity.photo = registration.photo || null;

    // user.name = registration.name;
    // user.slackUserId = registration.slackUserId || null;
    // user.slackTeamId = registration.slackTeamId || null;
    // user.photo = registration.photo || user.photo;

    // if (registration.language) {
    //   user.language = registration.language;
    // }
    // user.email = registration.email; // should not be needed

    // await userRepository.save(user);
    // await identityRepository.save(identity);

    // return identity;
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
    const existingIdentity = await identityRepository.findOne(
      { username, accountType: 'anonymous' }
      // { select }
    );

    if (!existingIdentity) {
      const hashedPassword = await hashPassword(password);
      const user = new UserEntity(v4(), actualUsername);
      const identity = new UserIdentityEntity(v4(), user, hashedPassword);

      identity.username = username;
      user.language = 'en';

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

    const isPasswordCorrect = await compare(
      password,
      existingIdentity.password
    );

    return isPasswordCorrect ? existingIdentity : null;
    // const user = await getOrCreateUser(manager, username);
    // const identity = new UserIdentityEntity(v4(), user, registration.password);
    // identity.username = registration.username;
    // identity.accountType = registration.type;
    // identity.photo = registration.photo || null;

    // user.name = registration.name;
    // user.slackUserId = registration.slackUserId || null;
    // user.slackTeamId = registration.slackTeamId || null;
    // if (registration.language) {
    //   user.language = registration.language;
    // }
    // user.email = registration.email;

    // await userRepository.save(user);
    // await identityRepository.save(identity);

    // // // If self-hosted we skip the requirement for email checks
    // // if (!config.SELF_HOSTED) {
    // //   identity.emailVerification = v4();
    // // }
    // // identity.accountType = 'password';
    // // const persistedUser = await getOrSaveUser(user);
    // return identity;
  });
}

async function getOrCreateIdentity(
  manager: EntityManager,
  username: string,
  accountType: AccountType
): Promise<UserIdentityEntity> {
  // const userRepository = manager.getCustomRepository(UserRepository);
  const identityRepository = manager.getCustomRepository(
    UserIdentityRepository
  );
  const identities = await identityRepository.find({
    where: { username, accountType },
  });

  if (identities.length) {
    // const foundIdentity = identities[0];
    // const foundUser = foundIdentity.user;

    return identities[0];
  }

  const user = await getOrCreateUser(manager, username);

  // user.name = registration.name;
  // user.slackUserId = registration.slackUserId || null;
  // user.slackTeamId = registration.slackTeamId || null;
  // user.photo = registration.photo || user.photo;

  // if (registration.language) {
  //   user.language = registration.language;
  // }

  const identity = new UserIdentityEntity(v4(), user);
  // identity.username = registration.username;
  // identity.accountType = registration.type;
  // identity.photo = registration.photo || null;

  return identity;
}

async function getOrCreateUser(
  manager: EntityManager,
  email: string
): Promise<UserEntity> {
  const userRepository = manager.getCustomRepository(UserRepository);
  const existingUser = await userRepository.findOne({
    where: { email },
  });
  if (existingUser) {
    return existingUser;
  }
  const user = new UserEntity(v4(), '');
  return await userRepository.save(user);
}

// export async function getOrSaveUser(user: UserEntity): Promise<UserEntity> {
//   return await transaction(async (manager) => {
//     const userRepository = manager.getCustomRepository(UserRepository);
//     const existingUser = await userRepository.findOne({
//       where: { username: user.username, accountType: user.accountType },
//     });
//     if (existingUser) {
//       return await userRepository.save({
//         ...existingUser,
//         email: user.email,
//         photo: user.photo,
//         slackUserId: user.slackUserId,
//         slackTeamId: user.slackTeamId,
//       });
//     }
//     return await userRepository.save(user);
//   });
// }

async function updateUserPassword(
  manager: EntityManager,
  identityId: string,
  password: string
): Promise<UserIdentityEntity | null> {
  const identityRepo = manager.getCustomRepository(UserIdentityRepository);
  const existingUser = await identityRepo.findOne(identityId);
  if (existingUser) {
    return await identityRepo.save({
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
