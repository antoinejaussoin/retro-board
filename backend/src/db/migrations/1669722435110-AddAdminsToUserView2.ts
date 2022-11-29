import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAdminsToUserView21669722435110 implements MigrationInterface {
    name = 'AddAdminsToUserView21669722435110'

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
  s1.id as "own_subscriptions_id",
  s1.plan as "own_plan",
  coalesce(s1.id, s2.id, s3.id) as "subscriptions_id",
  coalesce(s1.active, s2.active, s3.active, false) as "pro", /* s4 should not be taken into account for Pro */
  coalesce(s1.plan, s2.plan, s3.plan, s4.plan) as "plan",
  coalesce(s1.domain, s2.domain, s3.domain, s4.domain) as "domain",
  coalesce(o1.name, o2.name, o3.name, o4.name) as "plan_owner",
  coalesce(o1.email, o2.email, o3.email, o4.email) as "plan_owner_email",
  coalesce(s1.admins, s2.admins, s3.admins, s4.admins) as "plan_admins"
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
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_view","select \n  u.id,\n  i.id as identity_id,\n  u.name,\n  i.account_type,\n  i.username,\n  u.currency,\n  u.stripe_id,\n  i.photo,\n  u.language,\n  u.email,\n  case when i.account_type = 'anonymous' and i.password is null then false else true end as \"can_delete_session\",\n  u.trial,\n  s1.id as \"own_subscriptions_id\",\n  s1.plan as \"own_plan\",\n  coalesce(s1.id, s2.id, s3.id) as \"subscriptions_id\",\n  coalesce(s1.active, s2.active, s3.active, false) as \"pro\", /* s4 should not be taken into account for Pro */\n  coalesce(s1.plan, s2.plan, s3.plan, s4.plan) as \"plan\",\n  coalesce(s1.domain, s2.domain, s3.domain, s4.domain) as \"domain\",\n  coalesce(o1.name, o2.name, o3.name, o4.name) as \"plan_owner\",\n  coalesce(o1.email, o2.email, o3.email, o4.email) as \"plan_owner_email\",\n  coalesce(s1.admins, s2.admins, s3.admins, s4.admins) as \"plan_admins\"\nfrom users_identities i\n\njoin users u on u.id = i.user_id\nleft join subscriptions s1 on s1.owner_id = u.id and s1.active is true\nleft join users o1 on o1.id = s1.owner_id\nleft join subscriptions s2 on s2.members @> ARRAY[u.email::text] and s2.active is true\nleft join users o2 on o2.id = s2.owner_id\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true\nleft join users o3 on o3.id = s3.owner_id\nleft join subscriptions s4 on s4.admins @> ARRAY[u.email::text] and s4.active is true\nleft join users o4 on o4.id = s4.owner_id"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","user_view","public"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`CREATE VIEW "user_view" AS select 
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
  coalesce(s1.id, s2.id, s3.id) as "subscriptions_id",
  coalesce(s1.active, s2.active, s3.active, s4.active, false) as "pro",
  coalesce(s1.plan, s2.plan, s3.plan, s4.plan) as "plan",
  coalesce(s1.domain, s2.domain, s3.domain, s4.domain) as "domain",
  coalesce(o1.name, o2.name, o3.name, o4.name) as "plan_owner",
  coalesce(o1.email, o2.email, o3.email, o4.email) as "plan_owner_email",
  coalesce(s1.admins, s2.admins, s3.admins, s4.admins) as "plan_admins"
from users_identities i

join users u on u.id = i.user_id
left join subscriptions s1 on s1.owner_id = u.id and s1.active is true
left join users o1 on o1.id = s1.owner_id
left join subscriptions s2 on s2.members @> ARRAY[u.email::text] and s2.active is true
left join users o2 on o2.id = s2.owner_id
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true
left join users o3 on o3.id = s3.owner_id
left join subscriptions s4 on s4.admins @> ARRAY[u.email::text] and s4.active is true
left join users o4 on o4.id = s4.owner_id`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_view","select \n  u.id,\n  i.id as identity_id,\n  u.name,\n  i.account_type,\n  i.username,\n  u.currency,\n  u.stripe_id,\n  i.photo,\n  u.language,\n  u.email,\n  case when i.account_type = 'anonymous' and i.password is null then false else true end as \"can_delete_session\",\n  u.trial,\n  s1.id as \"own_subscriptions_id\",\n  s1.plan as \"own_plan\",\n  coalesce(s1.id, s2.id, s3.id) as \"subscriptions_id\",\n  coalesce(s1.active, s2.active, s3.active, s4.active, false) as \"pro\",\n  coalesce(s1.plan, s2.plan, s3.plan, s4.plan) as \"plan\",\n  coalesce(s1.domain, s2.domain, s3.domain, s4.domain) as \"domain\",\n  coalesce(o1.name, o2.name, o3.name, o4.name) as \"plan_owner\",\n  coalesce(o1.email, o2.email, o3.email, o4.email) as \"plan_owner_email\",\n  coalesce(s1.admins, s2.admins, s3.admins, s4.admins) as \"plan_admins\"\nfrom users_identities i\n\njoin users u on u.id = i.user_id\nleft join subscriptions s1 on s1.owner_id = u.id and s1.active is true\nleft join users o1 on o1.id = s1.owner_id\nleft join subscriptions s2 on s2.members @> ARRAY[u.email::text] and s2.active is true\nleft join users o2 on o2.id = s2.owner_id\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true\nleft join users o3 on o3.id = s3.owner_id\nleft join subscriptions s4 on s4.admins @> ARRAY[u.email::text] and s4.active is true\nleft join users o4 on o4.id = s4.owner_id"]);
    }

}
