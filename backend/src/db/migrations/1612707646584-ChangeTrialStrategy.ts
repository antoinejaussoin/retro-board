import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeTrialStrategy1612707646584 implements MigrationInterface {
    name = 'ChangeTrialStrategy1612707646584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`, ["public","user_view"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "trial"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "trial" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE VIEW "user_view" AS 
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
  u.trial,
  s.id as "ownSubscriptionsId",
  s.plan as "ownPlan",
  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",
  coalesce(s.active, s2.active, s3.active, false) as "pro",
  coalesce(s.plan, s2.plan, s3.plan) as "plan",
  coalesce(s.domain, s2.domain, s3.domain) as "domain"
from users u 

left join subscriptions s on s."ownerId" = u.id and s.active is true
left join subscriptions s2 on u.email = ANY(s2.members) and s2.active is true
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","user_view","select \n  u.id,\n  u.name,\n  u.\"accountType\",\n  u.username,\n  u.currency,\n  u.\"stripeId\",\n  u.photo,\n  u.language,\n  u.email,\n  u.trial,\n  s.id as \"ownSubscriptionsId\",\n  s.plan as \"ownPlan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptionsId\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\"\nfrom users u \n\nleft join subscriptions s on s.\"ownerId\" = u.id and s.active is true\nleft join subscriptions s2 on u.email = ANY(s2.members) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`, ["public","user_view"]);
        await queryRunner.query(`DROP VIEW "user_view"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trial"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "trial" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE VIEW "user_view" AS select 
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
		select count(*) from subscriptions t
		where
			t.trial is not null and (
				t."ownerId" = u.id 
				or u.email = ANY(t.members)
				or t.domain = split_part(u.email, '@', 2)
			)
	) as "trialCount"
from users u 

left join subscriptions s on s."ownerId" = u.id and s.active is true and (s.trial is null or s.trial > now())
left join subscriptions s2 on u.email = ANY(s2.members) and s2.active is true and (s2.trial is null or s2.trial > now())
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true and (s3.trial is null or s3.trial > now())`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","user_view","select \n  u.id,\n  u.name,\n  u.\"accountType\",\n  u.username,\n  u.currency,\n  u.\"stripeId\",\n  u.photo,\n  u.language,\n  u.email,\n  s.id as \"ownSubscriptionsId\",\n  s.plan as \"ownPlan\",\n  coalesce(s.id, s2.id, s3.id) as \"subscriptionsId\",\n  coalesce(s.active, s2.active, s3.active, false) as \"pro\",\n  coalesce(s.plan, s2.plan, s3.plan) as \"plan\",\n  coalesce(s.domain, s2.domain, s3.domain) as \"domain\",\n  coalesce(s.trial, s2.trial, s3.trial) as \"trial\",\n \t(\n\t\tselect count(*) from subscriptions t\n\t\twhere\n\t\t\tt.trial is not null and (\n\t\t\t\tt.\"ownerId\" = u.id \n\t\t\t\tor u.email = ANY(t.members)\n\t\t\t\tor t.domain = split_part(u.email, '@', 2)\n\t\t\t)\n\t) as \"trialCount\"\nfrom users u \n\nleft join subscriptions s on s.\"ownerId\" = u.id and s.active is true and (s.trial is null or s.trial > now())\nleft join subscriptions s2 on u.email = ANY(s2.members) and s2.active is true and (s2.trial is null or s2.trial > now())\nleft join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true and (s3.trial is null or s3.trial > now())"]);
    }

}
