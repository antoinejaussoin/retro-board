import { UserView } from '../entities';
import { getUserView } from './users';
import { transaction } from './transaction';
import {
  PostGroupRepository,
  PostRepository,
  SessionRepository,
  VoteRepository,
} from '../repositories';
import { deleteAccount } from './delete';

export async function mergeUsers(
  mainUserId: string,
  mergedUserIds: string[]
): Promise<boolean> {
  console.log('Merging users', mainUserId, mergedUserIds);

  for (const target of mergedUserIds) {
    await mergeOne(mainUserId, target);
  }

  return true;
}

async function mergeOne(main: string, target: string) {
  console.log('Merge ', main, target);
  const mainUser = await getUserView(main);
  const targetUser = await getUserView(target);

  if (mainUser && targetUser) {
    if (targetUser.id === mainUser.id) {
      console.error(
        ' >>> You should not merge one identity to another of the same account',
        mainUser.id,
        mainUser.identityId,
        targetUser.identityId
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
    ` > Migrating data from ${target.id} (${target.name}) to ${main.id} (${main.name})`
  );
  return await transaction(async (manager) => {
    const voteRepo = manager.getCustomRepository(VoteRepository);
    const postRepo = manager.getCustomRepository(PostRepository);
    const groupRepo = manager.getCustomRepository(PostGroupRepository);
    const sessionRepo = manager.getCustomRepository(SessionRepository);

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
      [main.id, target.id]
    );

    await voteRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } }
    );
    await postRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } }
    );
    await groupRepo.update(
      { user: { id: target.id } },
      { user: { id: main.id } }
    );
    await sessionRepo.update(
      { createdBy: { id: target.id } },
      { createdBy: { id: main.id } }
    );
  });
}
