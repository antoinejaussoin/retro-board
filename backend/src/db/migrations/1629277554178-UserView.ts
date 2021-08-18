import {MigrationInterface, QueryRunner} from "typeorm";

export class UserView1629277554178 implements MigrationInterface {
    name = 'UserView1629277554178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","user_view"]);
        await queryRunner.query(`DROP VIEW "public"."user_view"`);
        await queryRunner.query(`CREATE VIEW "user_view" AS 
  select 
  u.id,
  i.id as "identityId",
  u.name,
  i."accountType",
  i.username,
  u.currency,
  u."stripeId",
  i.photo,
  u.language,
  u.email,
  case when i."accountType" = 'anonymous' and i.password is null then false else true end as "canDeleteSession",
  u.trial,
  s.id as "ownSubscriptionsId",
  s.plan as "ownPlan",
  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain"
from users_identities i

join users u on u.id = i."userId"
left join subscriptions s on s."ownerId" = u.id and s.active is true
left join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","user_view","select \n  u.id,\n  i.id as \"identityId\",\n  u.name,\n  i.\"accountType\",\n  i.username,\n  u.currency,\n  u.\"stripeId\",\n  i.photo,\n  u.language,\n  u.email,\n  case when i.\"accountType\" = 'anonymous' and i.password is null then false else true end as \"canDeleteSession\",\n  u.trial,\n  s.id as \"ownSubscriptionsId\",\n  s.plan as \"ownPlan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptionsId\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\"\nfrom users_identities i\n\njoin users u on u.id = i.\"userId\"\nleft join subscriptions s on s.\"ownerId\" = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","user_view"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`CREATE VIEW "public"."user_view" AS select 
  i.id,
  u.id as "userId",
  u.name,
  i."accountType",
  i.username,
  u.currency,
  u."stripeId",
  i.photo,
  u.language,
  u.email,
  case when i."accountType" = 'anonymous' and i.password is null then false else true end as "canDeleteSession",
  u.trial,
  s.id as "ownSubscriptionsId",
  s.plan as "ownPlan",
  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain"
from users_identities i

join users u on u.id = i."userId"
left join subscriptions s on s."ownerId" = u.id and s.active is true
left join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","user_view","select \n  i.id,\n  u.id as \"userId\",\n  u.name,\n  i.\"accountType\",\n  i.username,\n  u.currency,\n  u.\"stripeId\",\n  i.photo,\n  u.language,\n  u.email,\n  case when i.\"accountType\" = 'anonymous' and i.password is null then false else true end as \"canDeleteSession\",\n  u.trial,\n  s.id as \"ownSubscriptionsId\",\n  s.plan as \"ownPlan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptionsId\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\"\nfrom users_identities i\n\njoin users u on u.id = i.\"userId\"\nleft join subscriptions s on s.\"ownerId\" = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true"]);
    }

}
