import type { Plan, Currency } from '../../common/index.js';
import {
  type SubscriptionEntity,
  type UserEntity,
  UserView,
} from '../entities/index.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { sql } from 'drizzle-orm';
import { getUser } from './users.js';
import { addDays } from 'date-fns';

export async function activateSubscription(
  userId: string,
  stripeSubscriptionId: string,
  plan: Plan,
  domain: string | null,
  currency: Currency,
): Promise<SubscriptionEntity> {
  return await drizzleTransaction(async (db) => {
    const user = await getUser(userId);
    if (!user) {
      throw Error('Cannot activate subscription on a non existing user');
    }

    // Check if subscription exists
    const existingResult = await db.execute(
      sql`SELECT id, active, domain FROM subscriptions WHERE id = ${stripeSubscriptionId}`,
    );
    const existingSub = existingResult.rows[0];

    if (!existingSub) {
      // Create new subscription
      await db.execute(
        sql`INSERT INTO subscriptions (id, active, plan, owner_id, domain, members, admins, created, updated) VALUES (${stripeSubscriptionId}, true, ${plan}, ${userId}, ${domain}, '{}', '{}', NOW(), NOW())`,
      );
    } else {
      // Update existing subscription
      await db.execute(
        sql`UPDATE subscriptions SET active = true, domain = ${domain}, updated = NOW() WHERE id = ${stripeSubscriptionId}`,
      );
    }

    // Update user currency
    await db.execute(
      sql`UPDATE users SET currency = ${currency}, updated = NOW() WHERE id = ${userId}`,
    );

    // Return the subscription (simplified)
    return {
      id: stripeSubscriptionId,
      active: true,
      plan,
      owner: user,
      domain,
      members: [],
      admins: [],
      created: new Date(),
      updated: new Date(),
    } as SubscriptionEntity;
  });
}

export async function cancelSubscription(
  stripeSubscriptionId: string,
): Promise<SubscriptionEntity | null> {
  return await drizzleTransaction(async (db) => {
    try {
      // Check if subscription exists
      const existingResult = await db.execute(
        sql`SELECT id, active, plan, owner_id, domain, members, admins, created, updated FROM subscriptions WHERE id = ${stripeSubscriptionId}`,
      );
      const existingSub = existingResult.rows[0];
      if (!existingSub) {
        throw Error('Cannot cancel a subscription that does not exist');
      }

      // Update to inactive
      await db.execute(
        sql`UPDATE subscriptions SET active = false, updated = NOW() WHERE id = ${stripeSubscriptionId}`,
      );

      // Return updated subscription
      const user = await getUser(existingSub.owner_id as string);
      if (user) {
        return {
          id: existingSub.id as string,
          active: false,
          plan: existingSub.plan as any,
          owner: user,
          domain: existingSub.domain as string | null,
          members: existingSub.members as string[],
          admins: existingSub.admins as string[],
          created: new Date(existingSub.created as string),
          updated: new Date(),
        } as SubscriptionEntity;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  });
}

export async function getActiveSubscriptionWhereUserIsOwner(
  userId: string,
): Promise<SubscriptionEntity | null> {
  return await drizzleTransaction(async (db) => {
    const result = await db.execute(
      sql`SELECT id, active, plan, owner_id, domain, members, admins, created, updated FROM subscriptions WHERE owner_id = ${userId} AND active = true ORDER BY updated DESC LIMIT 1`,
    );
    const subscription = result.rows[0];
    if (!subscription) {
      return null;
    }

    const user = await getUser(subscription.owner_id as string);
    if (user) {
      return {
        id: subscription.id as string,
        active: subscription.active as boolean,
        plan: subscription.plan as any,
        owner: user,
        domain: subscription.domain as string | null,
        members: subscription.members as string[],
        admins: subscription.admins as string[],
        created: new Date(subscription.created as string),
        updated: new Date(subscription.updated as string),
      } as SubscriptionEntity;
    }
    return null;
  });
}

export async function getActiveSubscriptionWhereUserIsAdmin(
  userId: string,
  email: string | null,
): Promise<SubscriptionEntity | null> {
  return await drizzleTransaction(async (db) => {
    let query = sql`SELECT id, active, plan, owner_id, domain, members, admins, created, updated FROM subscriptions WHERE active = true AND (owner_id = ${userId}`;
    if (email) {
      query = sql`${query} OR ${email} = ANY(admins)) ORDER BY updated DESC LIMIT 1`;
    } else {
      query = sql`${query}) ORDER BY updated DESC LIMIT 1`;
    }

    const result = await db.execute(query);
    const subscription = result.rows[0];
    if (!subscription) {
      return null;
    }

    const user = await getUser(subscription.owner_id as string);
    if (user) {
      return {
        id: subscription.id as string,
        active: subscription.active as boolean,
        plan: subscription.plan as any,
        owner: user,
        domain: subscription.domain as string | null,
        members: subscription.members as string[],
        admins: subscription.admins as string[],
        created: new Date(subscription.created as string),
        updated: new Date(subscription.updated as string),
      } as SubscriptionEntity;
    }
    return null;
  });
}

export async function saveSubscription(
  subscription: SubscriptionEntity,
): Promise<void> {
  return await drizzleTransaction(async (db) => {
    await db.execute(
      sql`UPDATE subscriptions SET active = ${subscription.active}, plan = ${subscription.plan}, domain = ${subscription.domain}, members = ${subscription.members}, admins = ${subscription.admins}, updated = NOW() WHERE id = ${subscription.id}`,
    );
  });
}

export async function startTrial(userId: string): Promise<UserEntity | null> {
  return await drizzleTransaction(async (db) => {
    // Check if user can start trial by querying the view
    const userViewResult = await db.execute(
      sql`SELECT id, trial, pro FROM users_view WHERE id = ${userId}`,
    );
    const userView = userViewResult.rows[0];
    if (userView && !userView.trial && !userView.pro) {
      const trialEnd = addDays(new Date(), 30);
      await db.execute(
        sql`UPDATE users SET trial = ${trialEnd.toISOString()}, updated = NOW() WHERE id = ${userId}`,
      );
      const user = await getUser(userId);
      if (user) {
        user.trial = trialEnd;
        return user;
      }
    }
    return null;
  });
}
