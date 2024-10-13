import type { UserView } from '../entities/index.js';
import { getUserView } from './users.js';
import { transaction } from './transaction.js';
import {
  PostGroupRepository,
  PostRepository,
  SessionRepository,
  VoteRepository,
} from '../repositories/index.js';
import { deleteAccount } from './delete.js';
import { getUserViewFromRequest } from '../../utils.js';
import type { Request } from 'express';
import AiChatRepository from '../repositories/AiChatRepository.js';

export async function mergeAnonymous(req: Request, newUserIdentityId: string) {
  const anonymousUser = await getUserViewFromRequest(req);
  const user = await getUserView(newUserIdentityId);
  if (user && anonymousUser && anonymousUser.accountType === 'anonymous') {
    await migrateOne(user, anonymousUser);
    await deleteOne(anonymousUser);
  }
}

export async function mergeUsers(
  mainUserIdentityId: string,
  mergedUserIdentityIds: string[],
): Promise<boolean> {
  for (const target of mergedUserIdentityIds) {
    await mergeOne(mainUserIdentityId, target);
  }

  return true;
}

async function mergeOne(main: string, target: string) {
  const mainUser = await getUserView(main);
  const targetUser = await getUserView(target);

  if (mainUser && targetUser) {
    if (targetUser.id === mainUser.id) {
      console.error(
        ' >>> You should not merge one identity to another of the same account',
        mainUser.id,
        mainUser.identityId,
        targetUser.identityId,
      );
      return;
    }
    await migrateOne(mainUser, targetUser);
    await deleteOne(targetUser);
  } else {
    console.error(' >>> Could not find users', mainUser, targetUser);
  }
}

async function deleteOne(target: UserView) {
  console.log(` > Deleting migrated user ${target.id} (${target.name})`);
  await deleteAccount(target, {
    deletePosts: true,
    deleteSessions: true,
    deleteVotes: true,
  });
}

async function migrateOne(main: UserView, target: UserView) {
  console.log(
    ` > Migrating data from ${target.id} (${target.name}) to ${main.id} (${main.name})`,
  );
  return await transaction(async (manager) => {
    const voteRepo = manager.withRepository(VoteRepository);
    const postRepo = manager.withRepository(PostRepository);
    const groupRepo = manager.withRepository(PostGroupRepository);
    const sessionRepo = manager.withRepository(SessionRepository);
    const aiChatRepo = manager.withRepository(AiChatRepository);

    await manager.query('update messages set user_id = $1 where user_id = $2', [
      main.id,
      target.id,
    ]);

    await manager.query(
      `update visitors set users_id = $1 where users_id = $2
			and not exists (
				select 1 from visitors v 
				where v.sessions_id = visitors.sessions_id and v.users_id = $1
			) 
			`,
      [main.id, target.id],
    );

    await aiChatRepo.update(
      { createdBy: { id: target.id } },
      { createdBy: { id: main.id } },
    );

    await voteRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } },
    );
    await postRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } },
    );
    await groupRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } },
    );
    await sessionRepo.update(
      { createdBy: { id: target.id } },
      { createdBy: { id: main.id } },
    );
  });
}
