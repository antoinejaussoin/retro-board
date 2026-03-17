import type { UserView } from '../entities/index.js';
import { getUserView } from './users.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { sql } from 'drizzle-orm';
import { deleteAccount } from './delete.js';
import { getUserViewFromRequest } from '../../utils.js';
import type { Request } from 'express';

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
  return await drizzleTransaction(async (db) => {
    // Update messages
    await db.execute(
      sql`UPDATE messages SET user_id = ${main.id} WHERE user_id = ${target.id}`,
    );

    // Update visitors with NOT EXISTS condition
    await db.execute(sql`
      UPDATE visitors SET users_id = ${main.id} WHERE users_id = ${target.id}
      AND NOT EXISTS (
        SELECT 1 FROM visitors v
        WHERE v.sessions_id = visitors.sessions_id AND v.users_id = ${main.id}
      )
    `);

    // Update ai_chat
    await db.execute(
      sql`UPDATE ai_chat SET created_by_id = ${main.id} WHERE created_by_id = ${target.id}`,
    );

    // Update votes
    await db.execute(
      sql`UPDATE votes SET user_id = ${main.id} WHERE user_id = ${target.id}`,
    );

    // Update posts
    await db.execute(
      sql`UPDATE posts SET user_id = ${main.id} WHERE user_id = ${target.id}`,
    );

    // Update post_groups
    await db.execute(
      sql`UPDATE post_groups SET user_id = ${main.id} WHERE user_id = ${target.id}`,
    );

    // Update sessions
    await db.execute(
      sql`UPDATE sessions SET created_by_id = ${main.id} WHERE created_by_id = ${target.id}`,
    );
  });
}
