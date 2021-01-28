import { ViewEntity, ViewColumn } from 'typeorm';
import { AccountType, FullUser, Currency, Plan } from '@retrospected/common';

@ViewEntity({
  expression: `
select 
  u.id,
  u.name,
  u."accountType",
  u.username,
  u.currency,
  u."stripeId",
  u.photo,
  u.language,
  u.email,
  s.id as "ownSubscriptionsId",
  s.plan as "ownPlan",
  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain",
  coalesce(s.trial, s2.trial, s3.trial) as "trial",
 	(
		select count(*) from users iu
		left join subscriptions t on t."ownerId" = iu.id and t.trial is not null
		left join subscriptions t2 on iu.email = ANY(t2.members) and t2.trial is not null
		left join subscriptions t3 on t3.domain = split_part(iu.email, '@', 2) and s3.trial is not null
		where iu.id = u.id
	) as "trialCount"
from users u 

left join subscriptions s on s."ownerId" = u.id and s.active is true and (s.trial is null or s.trial > now())
left join subscriptions s2 on u.email = ANY(s2.members) and s2.active is true and (s2.trial is null or s2.trial > now())
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true and (s3.trial is null or s3.trial > now())
  `,
})
export default class UserView {
  @ViewColumn()
  public id: string;
  @ViewColumn()
  public name: string;
  @ViewColumn()
  public accountType: AccountType;
  @ViewColumn()
  public username: string | null;
  @ViewColumn()
  public email: string | null;
  @ViewColumn()
  public stripeId: string | null;
  @ViewColumn()
  public photo: string | null;
  @ViewColumn()
  public language: string;
  @ViewColumn()
  public ownSubscriptionsId: string | null;
  @ViewColumn()
  public ownPlan: Plan | null;
  @ViewColumn()
  public subscriptionsId: string | null;
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
  @ViewColumn()
  public trialCount: number;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.language = 'en';
    this.accountType = 'anonymous';
    this.username = null;
    this.photo = null;
    this.stripeId = null;
    this.subscriptionsId = null;
    this.pro = false;
    this.email = null;
    this.currency = null;
    this.ownPlan = null;
    this.ownSubscriptionsId = null;
    this.plan = null;
    this.domain = null;
    this.trial = null;
    this.trialCount = 0;
  }

  toJson(): FullUser {
    return {
      id: this.id,
      name: this.name,
      photo: this.photo,
      email: this.email,
      pro: this.pro,
      subscriptionsId: this.subscriptionsId,
      accountType: this.accountType,
      language: this.language,
      username: this.username,
      stripeId: this.stripeId,
      currency: this.currency,
      plan: this.plan,
      domain: this.domain,
      ownPlan: this.ownPlan,
      ownSubscriptionsId: this.ownSubscriptionsId,
      trial: this.trial,
      trialCount: this.trialCount,
    };
  }
}
