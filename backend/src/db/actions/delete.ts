import { DeleteAccountPayload } from '@retrospected/common';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { UserIdentityEntity, UserView } from '../entities';
import {
  PostGroupRepository,
  PostRepository,
  SessionRepository,
  VoteRepository,
} from '../repositories';
import { transaction } from './transaction';
import { registerAnonymousUser } from './users';

export async function deleteAccount(
  user: UserView,
  options: DeleteAccountPayload
): Promise<boolean> {
  const anonymousAccount = await createAnonymousAccount();
  if (!anonymousAccount) {
    throw new Error('Could not create a anonymous account');
  }

  return await transaction(async (manager) => {
    await deleteVisits(manager, options.deleteSessions, user, anonymousAccount);
    await deleteVotes(manager, options.deleteVotes, user, anonymousAccount);
    await deletePosts(manager, options.deletePosts, user, anonymousAccount);
    await deleteSessions(
      manager,
      options.deleteSessions,
      user,
      anonymousAccount
    );
    await deleteUserAccount(manager, user);
    return true;
  });
}

async function deleteVisits(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  if (hardDelete) {
    await manager.query('delete from visitors where "usersId" = $1', [user.id]);
  } else {
    await manager.query(
      'update visitors set "usersId" = $1 where "usersId" = $2',
      [anon.user.id, user.id]
    );
  }
}

async function deleteVotes(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  const repo = manager.getCustomRepository(VoteRepository);
  if (hardDelete) {
    await repo.delete({ user: { id: user.id } });
    return true;
  } else {
    await repo.update({ user: { id: user.id } }, { user: anon.user });
    return true;
  }
}

async function deletePosts(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  const repo = manager.getCustomRepository(PostRepository);
  const groupRepo = manager.getCustomRepository(PostGroupRepository);
  if (hardDelete) {
    await manager.query(
      `
			delete from votes where "postId" in (select id from posts where "userId" = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			update posts set "groupId" = null where "groupId" in (select id from groups where "userId" = $1)
			`,
      [user.id]
    );
    await repo.delete({ user: { id: user.id } });
    await groupRepo.delete({ user: { id: user.id } });
    return true;
  } else {
    await repo.update({ user: { id: user.id } }, { user: anon.user });
    await groupRepo.update({ user: { id: user.id } }, { user: anon.user });
    return true;
  }
}

async function deleteSessions(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  const repo = manager.getCustomRepository(SessionRepository);
  if (hardDelete) {
    await manager.query(
      `
			delete from votes where "postId" in (select id from posts where "sessionId" in (select id from sessions where "createdById" = $1))
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from posts where "sessionId" in (select id from sessions where "createdById" = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from groups where "sessionId" in (select id from sessions where "createdById" = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from columns where "sessionId" in (select id from sessions where "createdById" = $1)
			`,
      [user.id]
    );
    await repo.delete({ createdBy: { id: user.id } });
    return true;
  } else {
    await repo.update({ createdBy: { id: user.id } }, { createdBy: anon.user });
    return true;
  }
}

async function deleteUserAccount(manager: EntityManager, user: UserView) {
  await manager.query(
    `
		update users set "defaultTemplateId" = null where "defaultTemplateId" in (select id from templates where "createdById" = $1)
		`,
    [user.id]
  );
  await manager.query(
    'delete from "templates-columns" where "templateId" in (select id from templates where "createdById" = $1)',
    [user.id]
  );
  await manager.query('delete from templates where "createdById" = $1', [
    user.id,
  ]);
  await manager.query('delete from subscriptions where "ownerId" = $1', [
    user.id,
  ]);
  await manager.query('delete from users_identities where "userId" = $1', [
    user.id,
  ]);
  await manager.query('delete from users where id = $1', [user.id]);
}

async function createAnonymousAccount() {
  const user = await registerAnonymousUser(`(deleted user)^${v4()}`, v4());
  return user;
}
