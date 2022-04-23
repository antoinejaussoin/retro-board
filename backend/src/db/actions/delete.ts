import { DeleteAccountPayload } from '../../common';
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
    await delMessages(manager, options.deleteSessions, user, anonymousAccount);
    await delVisits(manager, options.deleteSessions, user, anonymousAccount);
    await delVotes(manager, options.deleteVotes, user, anonymousAccount);
    await delPosts(manager, options.deletePosts, user, anonymousAccount);
    await delSessions(manager, options.deleteSessions, user, anonymousAccount);
    await delUserAccount(manager, user);
    return true;
  });
}

async function delMessages(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  if (hardDelete) {
    await manager.query('delete from messages where user_id = $1', [user.id]);
  } else {
    await manager.query('update messages set user_id = $1 where user_id = $2', [
      anon.user.id,
      user.id,
    ]);
  }
}

async function delVisits(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  if (hardDelete) {
    await manager.query('delete from visitors where users_id = $1', [user.id]);
  } else {
    await manager.query(
      'update visitors set users_id = $1 where users_id = $2',
      [anon.user.id, user.id]
    );
  }
}

async function delVotes(
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

async function delPosts(
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
			delete from votes where post_id in (select id from posts where user_id = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			update posts set group_id = null where group_id in (select id from groups where user_id = $1)
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

async function delSessions(
  manager: EntityManager,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity
) {
  const repo = manager.getCustomRepository(SessionRepository);
  if (hardDelete) {
    await manager.query(
      `
			delete from votes where post_id in (select id from posts where session_id in (select id from sessions where created_by_id = $1))
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from posts where session_id in (select id from sessions where created_by_id = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from groups where session_id in (select id from sessions where created_by_id = $1)
			`,
      [user.id]
    );
    await manager.query(
      `
			delete from columns where session_id in (select id from sessions where created_by_id = $1)
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

async function delUserAccount(manager: EntityManager, user: UserView) {
  await manager.query(
    `
		update users set default_template_id = null where default_template_id in (select id from templates where created_by_id = $1)
		`,
    [user.id]
  );
  await manager.query(
    'delete from templates_columns where template_id in (select id from templates where created_by_id = $1)',
    [user.id]
  );
  await manager.query('delete from templates where created_by_id = $1', [
    user.id,
  ]);
  await manager.query('delete from subscriptions where owner_id = $1', [
    user.id,
  ]);
  await manager.query('delete from users_identities where user_id = $1', [
    user.id,
  ]);
  await manager.query('delete from users where id = $1', [user.id]);
}

async function createAnonymousAccount() {
  const user = await registerAnonymousUser(`(deleted user)^${v4()}`, v4());
  return user;
}
