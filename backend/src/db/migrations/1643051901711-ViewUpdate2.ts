import {MigrationInterface, QueryRunner} from "typeorm";

export class ViewUpdate21643051901711 implements MigrationInterface {
    name = 'ViewUpdate21643051901711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","user_view","public"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`CREATE VIEW "user_view" AS 
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
  s.id as "own_subscriptions_id",
  s.plan as "own_plan",
  coalesce(s.id, s2.id, s3.id) as "subscriptions_id",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain"
from users_identities i

join users u on u.id = i.user_id
left join subscriptions s on s.owner_id = u.id and s.active is true
left join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_view","select \n  u.id,\n  i.id as identity_id,\n  u.name,\n  i.account_type,\n  i.username,\n  u.currency,\n  u.stripe_id,\n  i.photo,\n  u.language,\n  u.email,\n  case when i.account_type = 'anonymous' and i.password is null then false else true end as \"can_delete_session\",\n  u.trial,\n  s.id as \"own_subscriptions_id\",\n  s.plan as \"own_plan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptions_id\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\"\nfrom users_identities i\n\njoin users u on u.id = i.user_id\nleft join subscriptions s on s.owner_id = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","user_view","public"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`CREATE VIEW "user_view" AS select 
  u.id,
  i.id as "identityId",
  u.name,
  i.account_type,
  i.username,
  u.currency,
  u.stripe_id,
  i.photo,
  u.language,
  u.email,
  case when i.account_type = 'anonymous' and i.password is null then false else true end as "canDeleteSession",
  u.trial,
  s.id as "ownSubscriptionsId",
  s.plan as "ownPlan",
  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain"
from users_identities i

join users u on u.id = i.user_id
left join subscriptions s on s.owner_id = u.id and s.active is true
left join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_view","select \n  u.id,\n  i.id as \"identityId\",\n  u.name,\n  i.account_type,\n  i.username,\n  u.currency,\n  u.stripe_id,\n  i.photo,\n  u.language,\n  u.email,\n  case when i.account_type = 'anonymous' and i.password is null then false else true end as \"canDeleteSession\",\n  u.trial,\n  s.id as \"ownSubscriptionsId\",\n  s.plan as \"ownPlan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptionsId\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\"\nfrom users_identities i\n\njoin users u on u.id = i.user_id\nleft join subscriptions s on s.owner_id = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true"]);
    }

}
