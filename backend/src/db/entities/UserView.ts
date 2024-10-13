import { ViewEntity, ViewColumn } from 'typeorm';
import type {
  AccountType,
  FullUser,
  Currency,
  Plan,
} from '../../common/index.js';

@ViewEntity({
  expression: `
select 
  u.id,
  i.id as identity_id,
  u.name,
  i.account_type,
  i.username,
  u.currency,
  u.stripe_id,
  i.photo,
  u.language,
  u.email,
  case when i.account_type = 'anonymous' and i.password is null then false else true end as "can_delete_session",
  u.trial,
  s1.id as "own_subscriptions_id",
  s1.plan as "own_plan",
  coalesce(s1.active, s2.active, s3.active, false) as "pro", /* s4 should not be taken into account for Pro */
  coalesce(s1.plan, s2.plan, s3.plan, s4.plan) as "plan",
  coalesce(s1.domain, s2.domain, s3.domain, s4.domain) as "domain",
  coalesce(o1.name, o2.name, o3.name, o4.name) as "plan_owner",
  coalesce(o1.email, o2.email, o3.email, o4.email) as "plan_owner_email",
  coalesce(s1.admins, s2.admins, s3.admins, s4.admins) as "plan_admins",
  coalesce(s1.members, s2.members, s3.members, s4.members) as "plan_members"
from users_identities i

join users u on u.id = i.user_id
left join subscriptions s1 on s1.owner_id = u.id and s1.active is true
left join users o1 on o1.id = s1.owner_id
left join subscriptions s2 on s2.members @> ARRAY[u.email::text] and s2.active is true
left join users o2 on o2.id = s2.owner_id
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true
left join users o3 on o3.id = s3.owner_id
left join subscriptions s4 on s4.admins @> ARRAY[u.email::text] and s4.active is true
left join users o4 on o4.id = s4.owner_id
  `,
})
export default class UserView {
  @ViewColumn()
  public id: string;
  @ViewColumn()
  public identityId: string;
  @ViewColumn()
  public name: string;
  @ViewColumn()
  public accountType: AccountType;
  @ViewColumn()
  public username: string | null;
  @ViewColumn()
  public email: string | null;
  @ViewColumn()
  public canDeleteSession: boolean;
  @ViewColumn()
  public stripeId: string | null;
  @ViewColumn()
  public photo: string | null;
  @ViewColumn()
  public language: string | null;
  @ViewColumn()
  public ownSubscriptionsId: string | null;
  @ViewColumn()
  public ownPlan: Plan | null;
  @ViewColumn()
  public planOwner: string | null;
  @ViewColumn()
  public planOwnerEmail: string | null;
  @ViewColumn()
  public planAdmins: string[] | null;
  @ViewColumn()
  public planMembers: string[] | null;
  @ViewColumn()
  public plan: Plan | null;
  @ViewColumn()
  public domain: string | null;
  @ViewColumn()
  public currency: Currency | null;
  @ViewColumn()
  public pro: boolean;
  @ViewColumn()
  public trial: Date | null;

  constructor(id: string, identityId: string, name: string) {
    this.id = id;
    this.identityId = identityId;
    this.name = name;
    this.language = null;
    this.accountType = 'anonymous';
    this.username = null;
    this.photo = null;
    this.stripeId = null;
    this.pro = false;
    this.email = null;
    this.canDeleteSession = false;
    this.currency = null;
    this.ownPlan = null;
    this.planOwner = null;
    this.planOwnerEmail = null;
    this.planAdmins = null;
    this.planMembers = null;
    this.ownSubscriptionsId = null;
    this.plan = null;
    this.domain = null;
    this.trial = null;
  }

  toJson(): FullUser {
    return {
      id: this.id,
      identityId: this.identityId,
      name: this.name,
      photo: this.photo,
      email: this.email,
      canDeleteSession: this.canDeleteSession,
      pro: this.pro,
      accountType: this.accountType,
      language: this.language,
      username: this.username,
      stripeId: this.stripeId,
      currency: this.currency,
      plan: this.plan,
      planOwner: this.planOwner,
      planOwnerEmail: this.planOwnerEmail,
      planAdmins: this.planAdmins,
      planMembers: this.planMembers,
      domain: this.domain,
      ownPlan: this.ownPlan,
      ownSubscriptionsId: this.ownSubscriptionsId,
      trial: this.trial,
    };
  }
}
