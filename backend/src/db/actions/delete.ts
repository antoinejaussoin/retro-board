import type { DeleteAccountPayload } from '../../common/index.js';
import type { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import type { UserIdentityEntity, UserView } from '../entities/index.js';
import {
  PostGroupRepository,
  PostRepository,
  SessionRepository,
  VoteRepository,
} from '../repositories/index.js';
import { transaction } from './transaction.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { getDrizzleConnection } from '../connection.js';
import { sql } from 'drizzle-orm';
import type { DrizzleTransaction } from '../drizzle-transaction.js';
import { registerAnonymousUser } from './users.js';

export async function deleteAccount(
  user: UserView,
  options: DeleteAccountPayload,
): Promise<boolean> {
  const anonymousAccount = await createAnonymousAccount();
  if (!anonymousAccount) {
    throw new Error('Could not create a anonymous account');
  }

  return await drizzleTransaction(async (tx) => {
    try {
      await delMessages(tx, options.deleteSessions, user, anonymousAccount);
      await delAiChat(tx, options.deletePosts, user, anonymousAccount);
      await delVisits(tx, options.deleteSessions, user, anonymousAccount);
      await delVotes(tx, options.deleteVotes, user, anonymousAccount);
      await delPosts(tx, options.deletePosts, user, anonymousAccount);
      await delSessions(tx, options.deleteSessions, user, anonymousAccount);
      await delUserAccount(tx, user);
      return true;
    } catch (ex) {
      console.log('Error while trying to delete account', ex);
      throw ex;
    }
  });
}

async function delMessages(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  const db = tx;
  if (hardDelete) {
    await db.execute(sql`delete from messages where user_id = ${user.id}`);
  } else {
    await db.execute(
      sql`update messages set user_id = ${anon.user.id} where user_id = ${user.id}`,
    );
  }
}

async function delAiChat(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  const db = tx;
  if (hardDelete) {
    await db.execute(sql`delete from ai_chat where created_by_id = ${user.id}`);
  } else {
    await db.execute(
      sql`update ai_chat set created_by_id = ${anon.user.id} where created_by_id = ${user.id}`,
    );
  }
}

async function delVisits(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  const db = tx;
  if (hardDelete) {
    await db.execute(sql`delete from visitors where users_id = ${user.id}`);
  } else {
    await db.execute(
      sql`update visitors set users_id = ${anon.user.id} where users_id = ${user.id}`,
    );
  }
}

async function delVotes(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  if (hardDelete) {
    // For hard delete, we need to delete votes where user_id matches
    const db = tx;
    await db.execute(sql`delete from votes where user_id = ${user.id}`);
    return true;
  }
  // For soft delete, update votes to anonymous user
  const db = tx;
  await db.execute(
    sql`update votes set user_id = ${anon.user.id} where user_id = ${user.id}`,
  );
  return true;
}

async function delPosts(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  const db = tx;
  if (hardDelete) {
    // Delete votes for posts by this user
    await db.execute(sql`
      delete from votes where post_id in (select id from posts where user_id = ${user.id})
    `);
    // Update posts to remove group references for groups by this user
    await db.execute(sql`
      update posts set group_id = null where group_id in (select id from post_groups where user_id = ${user.id})
    `);
    // Delete posts by this user
    await db.execute(sql`delete from posts where user_id = ${user.id}`);
    // Delete post groups by this user
    await db.execute(sql`delete from post_groups where user_id = ${user.id}`);
    return true;
  }
  // Soft delete: update posts and groups to anonymous user
  await db.execute(
    sql`update posts set user_id = ${anon.user.id} where user_id = ${user.id}`,
  );
  await db.execute(
    sql`update post_groups set user_id = ${anon.user.id} where user_id = ${user.id}`,
  );
  return true;
}

async function delSessions(
  tx: DrizzleTransaction,
  hardDelete: boolean,
  user: UserView,
  anon: UserIdentityEntity,
) {
  const db = tx;
  if (hardDelete) {
    // Delete votes for posts in sessions created by this user
    await db.execute(sql`
      delete from votes where post_id in (
        select id from posts where session_id in (
          select id from sessions where created_by_id = ${user.id}
        )
      )
    `);
    // Delete posts in sessions created by this user
    await db.execute(sql`
      delete from posts where session_id in (
        select id from sessions where created_by_id = ${user.id}
      )
    `);
    // Delete groups in sessions created by this user
    await db.execute(sql`
      delete from post_groups where session_id in (
        select id from sessions where created_by_id = ${user.id}
      )
    `);
    // Delete columns in sessions created by this user
    await db.execute(sql`
      delete from column_definitions where session_id in (
        select id from sessions where created_by_id = ${user.id}
      )
    `);
    // Delete sessions created by this user
    await db.execute(
      sql`delete from sessions where created_by_id = ${user.id}`,
    );
    return true;
  }
  // Soft delete: update sessions to anonymous user
  await db.execute(
    sql`update sessions set created_by_id = ${anon.user.id} where created_by_id = ${user.id}`,
  );
  return true;
}

async function delUserAccount(tx: DrizzleTransaction, user: UserView) {
  const db = tx;
  // Update users to remove default template references
  await db.execute(sql`
    update users set default_template_id = null where default_template_id in (
      select id from session_templates where created_by_id = ${user.id}
    )
  `);
  // Delete template columns (if any)
  await db.execute(sql`
    delete from template_columns where template_id in (
      select id from session_templates where created_by_id = ${user.id}
    )
  `);
  // Delete templates
  await db.execute(
    sql`delete from session_templates where created_by_id = ${user.id}`,
  );
  // Delete subscriptions
  await db.execute(sql`delete from subscriptions where owner_id = ${user.id}`);
  // Delete user identities
  await db.execute(
    sql`delete from users_identities where user_id = ${user.id}`,
  );
  // Delete user
  await db.execute(sql`delete from users where id = ${user.id}`);
}

async function createAnonymousAccount() {
  const user = await registerAnonymousUser(`(deleted user)^${v4()}`, v4());
  return user;
}
