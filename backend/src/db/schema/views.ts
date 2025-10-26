import {
  pgView,
  varchar,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User View - matches the TypeORM UserView entity
export const userView = pgView('user_view').as((qb) =>
  qb
    .select({
      id: sql<string>`u.id`.as('id'),
      identityId: sql<string>`i.id`.as('identity_id'),
      name: sql<string>`u.name`.as('name'),
      accountType: sql<string>`i.account_type`.as('account_type'),
      username: sql<string | null>`i.username`.as('username'),
      currency: sql<string | null>`u.currency`.as('currency'),
      stripeId: sql<string | null>`u.stripe_id`.as('stripe_id'),
      photo: sql<string | null>`i.photo`.as('photo'),
      language: sql<string | null>`u.language`.as('language'),
      email: sql<string | null>`u.email`.as('email'),
      canDeleteSession:
        sql<boolean>`case when i.account_type = 'anonymous' and i.password is null then false else true end`.as(
          'can_delete_session',
        ),
      trial: sql<Date | null>`u.trial`.as('trial'),
      ownSubscriptionsId: sql<string | null>`s1.id`.as('own_subscriptions_id'),
      ownPlan: sql<string | null>`s1.plan`.as('own_plan'),
      pro: sql<boolean>`coalesce(s1.active, s2.active, s3.active, false)`.as(
        'pro',
      ),
      plan: sql<string | null>`coalesce(s1.plan, s2.plan, s3.plan, s4.plan)`.as(
        'plan',
      ),
      domain: sql<
        string | null
      >`coalesce(s1.domain, s2.domain, s3.domain, s4.domain)`.as('domain'),
      planOwner: sql<
        string | null
      >`coalesce(o1.name, o2.name, o3.name, o4.name)`.as('plan_owner'),
      planOwnerEmail: sql<
        string | null
      >`coalesce(o1.email, o2.email, o3.email, o4.email)`.as(
        'plan_owner_email',
      ),
      planAdmins: sql<
        string[] | null
      >`coalesce(s1.admins, s2.admins, s3.admins, s4.admins)`.as('plan_admins'),
      planMembers: sql<
        string[] | null
      >`coalesce(s1.members, s2.members, s3.members, s4.members)`.as(
        'plan_members',
      ),
    })
    .from(sql`users_identities i`)
    .leftJoin(sql`users u`, sql`u.id = i.user_id`)
    .leftJoin(
      sql`subscriptions s1`,
      sql`s1.owner_id = u.id and s1.active is true`,
    )
    .leftJoin(sql`users o1`, sql`o1.id = s1.owner_id`)
    .leftJoin(
      sql`subscriptions s2`,
      sql`s2.members @> ARRAY[u.email::text] and s2.active is true`,
    )
    .leftJoin(sql`users o2`, sql`o2.id = s2.owner_id`)
    .leftJoin(
      sql`subscriptions s3`,
      sql`s3.domain = split_part(u.email, '@', 2) and s3.active is true`,
    )
    .leftJoin(sql`users o3`, sql`o3.id = s3.owner_id`)
    .leftJoin(
      sql`subscriptions s4`,
      sql`s4.admins @> ARRAY[u.email::text] and s4.active is true`,
    )
    .leftJoin(sql`users o4`, sql`o4.id = s4.owner_id`),
);

// Session View - matches the TypeORM SessionView entity
export const sessionView = pgView('session_view').as((qb) =>
  qb
    .select({
      id: sql<string>`s.id`.as('id'),
      name: sql<string>`s.name`.as('name'),
      created: sql<Date>`s.created`.as('created'),
      createdBy: sql<object>`(
        select to_jsonb(cb) from (
          select cbu.id, cbu.name, cbu.photo from users cbu
          where cbu.id = s.created_by_id
        ) as cb
      )`.as('created_by'),
      encrypted: sql<string | null>`s.encrypted`.as('encrypted'),
      locked: sql<boolean>`s.locked`.as('locked'),
      numberOfActions: sql<number>`(
        select count(*) from posts p 
        where p.session_id = s.id and p.action is not null
      )`.as('number_of_actions'),
      numberOfPosts: sql<number>`(
        select count(*) from posts p 
        where p.session_id = s.id
      )`.as('number_of_posts'),
      numberOfVotes: sql<number>`(
        select count(*) from votes vv
        left join posts vp on vp.id = vv.post_id
        where vp.session_id = s.id
      )`.as('number_of_votes'),
      participants: sql<object[]>`(
        select json_agg(vis) from (
          select vu.id, vu.name, vu.photo from visitors v
          join users vu on vu.id = v.users_id
          where v.sessions_id = s.id
        ) as vis
      )`.as('participants'),
    })
    .from(sql`sessions s`)
    .leftJoin(sql`users u`, sql`s.created_by_id = u.id`)
    .orderBy(sql`s.updated desc`),
);

// Type inference for views works differently
export type UserViewRow = {
  id: string;
  identityId: string;
  name: string;
  accountType: string;
  username: string | null;
  currency: string | null;
  stripeId: string | null;
  photo: string | null;
  language: string | null;
  email: string | null;
  canDeleteSession: boolean;
  trial: Date | null;
  ownSubscriptionsId: string | null;
  ownPlan: string | null;
  pro: boolean;
  plan: string | null;
  domain: string | null;
  planOwner: string | null;
  planOwnerEmail: string | null;
  planAdmins: string[] | null;
  planMembers: string[] | null;
};

export type SessionViewRow = {
  id: string;
  name: string;
  created: Date;
  createdBy: object;
  encrypted: string | null;
  locked: boolean;
  numberOfActions: number;
  numberOfPosts: number;
  numberOfVotes: number;
  participants: object[];
};
