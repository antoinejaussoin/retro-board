import { MigrationInterface, QueryRunner } from 'typeorm';

export class BigRenaming1643049742051 implements MigrationInterface {
  name = 'BigRenaming1643049742051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * RENAMING COLUMNS
     */
    await queryRunner.query(
      `ALTER TABLE "users_identities" DROP CONSTRAINT "FK_a10dca6aa6bda5865287bf2792a"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_5b086b03bb64304390cec7635ec"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT "FK_c58b12b1a7b4012bb238bc26542"`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" DROP CONSTRAINT "FK_37907d102f38ece687182bf5237"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" DROP CONSTRAINT "FK_c96b807f7154ddb4fb7017af12e"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_9ad140fba0b4ad9559e65302825"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_898cf6af34722df13f760cc364f"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_066163c46cda7e8187f96bc87a0"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_5169384e31d0989699a318f3ca4"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_b5b05adc89dda0614276a13a599"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_764b665f832e28c01595ec15cf3"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_d10acbe503da4c56853181efc98"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_331400b3a08ee505d42ddba1db0"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "FK_d50229c10adbf294a228c35cb19"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c67bd4e6a014698751d9242e3"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a10dca6aa6bda5865287bf2792"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b086b03bb64304390cec7635e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c58b12b1a7b4012bb238bc2654"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_898cf6af34722df13f760cc364"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ad140fba0b4ad9559e6530282"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_066163c46cda7e8187f96bc87a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4838cd4fc48a6ff2d4aa01aa64"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d26fe2e6102cd9c47650a0d7a6"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5169384e31d0989699a318f3ca"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5b05adc89dda0614276a13a59"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_764b665f832e28c01595ec15cf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae05faaa55c866130abef6e1fe"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d10acbe503da4c56853181efc9"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_331400b3a08ee505d42ddba1db"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89c90edf2f369cfbcb220d2e09"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d50229c10adbf294a228c35cb1"`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" RENAME COLUMN "sessionId" TO "session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" RENAME COLUMN "templateId" TO "template_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" RENAME COLUMN "ownerId" TO "owner_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "accountType" TO "account_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "emailVerification" TO "email_verification"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "userId" TO "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "defaultTemplateId" TO "default_template_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "stripeId" TO "stripe_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "slackUserId" TO "slack_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "slackTeamId" TO "slack_team_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "createdById" TO "created_by_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsMaxupvotes" TO "options_max_up_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsMaxdownvotes" TO "options_max_down_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowactions" TO "options_allow_actions"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowselfvoting" TO "options_allow_self_voting"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowmultiplevotes" TO "options_allow_multiple_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowauthorvisible" TO "options_allow_author_visible"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowgiphy" TO "options_allow_giphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowgrouping" TO "options_allow_grouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsAllowreordering" TO "options_allow_reordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsBlurcards" TO "options_blur_cards"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsMaxposts" TO "options_max_posts"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "optionsNewpostsfirst" TO "options_new_posts_first"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" RENAME COLUMN "sessionId" TO "session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" RENAME COLUMN "userId" TO "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "sessionId" TO "session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "userId" TO "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "createdById" TO "created_by_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsMaxupvotes" TO "options_max_up_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsMaxdownvotes" TO "options_max_down_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowactions" TO "options_allow_actions"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowselfvoting" TO "options_allow_self_voting"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowmultiplevotes" TO "options_allow_multiple_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowauthorvisible" TO "options_allow_author_visible"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowgiphy" TO "options_allow_giphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowgrouping" TO "options_allow_grouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsAllowreordering" TO "options_allow_reordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsBlurcards" TO "options_blur_cards"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsMaxposts" TO "options_max_posts"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "optionsNewpostsfirst" TO "options_new_posts_first"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "userId" TO "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "postId" TO "post_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "sessionId" TO "session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "userId" TO "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "groupId" TO "group_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" RENAME COLUMN "stripeCustomerId" TO "stripe_customer_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" RENAME COLUMN "stripeSessionId" TO "stripe_session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT IF EXISTS "PK_c16501c34b8530a425739e400bd"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "sessionsId" to "sessions_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "usersId" to "users_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "PK_96af66c2594330cf6578ef210c2" PRIMARY KEY ("sessions_id", "users_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3b8654b4e2311526fcefdb9ce" ON "users_identities" ("user_id") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_de8111fd70689bb6934b7650e5" ON "users_identities" ("username", "account_type") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac509eeb1d008dda662c19bc2a" ON "users" ("default_template_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fe85a796a57a6cccfaa2dff03" ON "templates" ("created_by_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e97c4fa8c699264016d1a4d92" ON "groups" ("session_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f71bda715870718997ed62f64" ON "groups" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff71b7760071ed9caba7f02beb" ON "messages" ("session_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_830a3c1d92614d1495418c4673" ON "messages" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ccf045da14e5350b26ee88259" ON "sessions" ("created_by_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27be2cab62274f6876ad6a3164" ON "votes" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18499a5b9b4cf71093f7b7f79f" ON "votes" ("post_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b08cabd478d3eb9fcc657d426" ON "posts" ("session_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7628aa3741a30d6217271a226c" ON "posts" ("group_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c4f9a7bd77b489e711277ee598" ON "posts" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dc6f309358b04777f86d1f3fe" ON "subscriptions" ("owner_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93910938d4f16f57a137da768b" ON "visitors" ("sessions_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44b69e6f1b8c5328046a6f6a2c" ON "visitors" ("users_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" ADD CONSTRAINT "FK_b3b8654b4e2311526fcefdb9ce8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_ac509eeb1d008dda662c19bc2a3" FOREIGN KEY ("default_template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD CONSTRAINT "FK_7fe85a796a57a6cccfaa2dff03c" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" ADD CONSTRAINT "FK_9f5aedb06b838d50b1b4a56e042" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" ADD CONSTRAINT "FK_f5ccf851c3134ac587eb4e794d9" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_4e97c4fa8c699264016d1a4d929" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_9f71bda715870718997ed62f64b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_ff71b7760071ed9caba7f02beb4" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_830a3c1d92614d1495418c46736" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_1ccf045da14e5350b26ee882592" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_27be2cab62274f6876ad6a31641" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_18499a5b9b4cf71093f7b7f79f8" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_5b08cabd478d3eb9fcc657d4269" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_7628aa3741a30d6217271a226cf" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7dc6f309358b04777f86d1f3fef" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "FK_93910938d4f16f57a137da768b3" FOREIGN KEY ("sessions_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "FK_44b69e6f1b8c5328046a6f6a2c0" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    /**
     * VIEWS UPDATE
     */
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'user_view', 'public']
    );
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
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'user_view',
        'select \n  u.id,\n  i.id as identity_id,\n  u.name,\n  i.account_type,\n  i.username,\n  u.currency,\n  u.stripe_id,\n  i.photo,\n  u.language,\n  u.email,\n  case when i.account_type = \'anonymous\' and i.password is null then false else true end as "can_delete_session",\n  u.trial,\n  s.id as "own_subscriptions_id",\n  s.plan as "own_plan",\n  coalesce(s.id, s2.id, s3.id) as "subscriptions_id",\n  coalesce(s.active, s2.active, s3.active, false) as "pro",\n  coalesce(s.plan, s2.plan, s3.plan) as "plan",\n  coalesce(s.domain, s2.domain, s3.domain) as "domain"\nfrom users_identities i\n\njoin users u on u.id = i.user_id\nleft join subscriptions s on s.owner_id = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, \'@\', 2) and s3.active is true',
      ]
    );

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'session_view', 'public']
    );
    await queryRunner.query(`DROP VIEW "session_view"`);
    await queryRunner.query(`CREATE VIEW "session_view" AS 
select 
	s.id,
	s.name,
	s.created,
	(
		select to_jsonb(cb) from (
			select cbu.id, cbu.name, cbu.photo from users cbu
			where cbu.id = s.created_by_id
		) as cb
	) as created_by,
	s.encrypted,
	s.locked,
	(select count(*) from posts p where p.session_id = s.id and p.action is not null) as "number_of_actions",	
	(select count(*) from posts p where p.session_id = s.id) as "number_of_posts",
	(
		select count(*) from votes vv
		left join posts vp on vp.id = vv.post_id
		where vp.session_id = s.id
	) as "number_of_votes",
	(
		select json_agg(vis) from (
			select vu.id, vu.name, vu.photo from visitors v
			join users vu on vu.id = v.users_id
			where v.sessions_id = s.id
		) as vis
	) as participants

from sessions s
left join users u on s.created_by_id = u.id

order by s.updated desc
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'session_view',
        'select \n\ts.id,\n\ts.name,\n\ts.created,\n\t(\n\t\tselect to_jsonb(cb) from (\n\t\t\tselect cbu.id, cbu.name, cbu.photo from users cbu\n\t\t\twhere cbu.id = s.created_by_id\n\t\t) as cb\n\t) as created_by,\n\ts.encrypted,\n\ts.locked,\n\t(select count(*) from posts p where p.session_id = s.id and p.action is not null) as "number_of_actions",\t\n\t(select count(*) from posts p where p.session_id = s.id) as "number_of_posts",\n\t(\n\t\tselect count(*) from votes vv\n\t\tleft join posts vp on vp.id = vv.post_id\n\t\twhere vp.session_id = s.id\n\t) as "number_of_votes",\n\t(\n\t\tselect json_agg(vis) from (\n\t\t\tselect vu.id, vu.name, vu.photo from visitors v\n\t\t\tjoin users vu on vu.id = v.users_id\n\t\t\twhere v.sessions_id = s.id\n\t\t) as vis\n\t) as participants\n\nfrom sessions s\nleft join users u on s.created_by_id = u.id\n\norder by s.updated desc',
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "FK_44b69e6f1b8c5328046a6f6a2c0"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "FK_93910938d4f16f57a137da768b3"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7dc6f309358b04777f86d1f3fef"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_7628aa3741a30d6217271a226cf"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_5b08cabd478d3eb9fcc657d4269"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_18499a5b9b4cf71093f7b7f79f8"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_27be2cab62274f6876ad6a31641"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_1ccf045da14e5350b26ee882592"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_830a3c1d92614d1495418c46736"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_ff71b7760071ed9caba7f02beb4"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_9f71bda715870718997ed62f64b"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_4e97c4fa8c699264016d1a4d929"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" DROP CONSTRAINT "FK_f5ccf851c3134ac587eb4e794d9"`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" DROP CONSTRAINT "FK_9f5aedb06b838d50b1b4a56e042"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT "FK_7fe85a796a57a6cccfaa2dff03c"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_ac509eeb1d008dda662c19bc2a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" DROP CONSTRAINT "FK_b3b8654b4e2311526fcefdb9ce8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44b69e6f1b8c5328046a6f6a2c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93910938d4f16f57a137da768b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7dc6f309358b04777f86d1f3fe"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c4f9a7bd77b489e711277ee598"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7628aa3741a30d6217271a226c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b08cabd478d3eb9fcc657d426"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18499a5b9b4cf71093f7b7f79f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27be2cab62274f6876ad6a3164"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ccf045da14e5350b26ee88259"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_830a3c1d92614d1495418c4673"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff71b7760071ed9caba7f02beb"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f71bda715870718997ed62f64"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e97c4fa8c699264016d1a4d92"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fe85a796a57a6cccfaa2dff03"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac509eeb1d008dda662c19bc2a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de8111fd70689bb6934b7650e5"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3b8654b4e2311526fcefdb9ce"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "PK_96af66c2594330cf6578ef210c2"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "users_id" to "usersId"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "sessions_id" to "sessionsId"`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" RENAME COLUMN "stripe_session_id" to "stripeSessionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" RENAME COLUMN "stripe_customer_id" to "stripeCustomerId"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "user_id" to "userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "group_id" to "groupId"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "session_id" to "sessionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "post_id" to "postId"`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "user_id" to "userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_new_posts_first" to "optionsNewpostsfirst"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_blur_cards" to "optionsBlurcards"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_reordering" to "optionsAllowreordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_grouping" to "optionsAllowgrouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_giphy" to "optionsAllowgiphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_author_visible" to "optionsAllowauthorvisible"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_multiple_votes" to "optionsAllowmultiplevotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_self_voting" to "optionsAllowselfvoting"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_allow_actions" to "optionsAllowactions"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_max_posts" to "optionsMaxposts"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_max_down_votes" to "optionsMaxdownvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "options_max_up_votes" to "optionsMaxupvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" RENAME COLUMN "created_by_id" to "createdById"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "user_id" to "userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "session_id" to "sessionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" RENAME COLUMN "user_id" to "userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" RENAME COLUMN "session_id" to "sessionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_new_posts_first" to "optionsNewpostsfirst"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_blur_cards" to "optionsBlurcards"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_reordering" to "optionsAllowreordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_grouping" to "optionsAllowgrouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_giphy" to "optionsAllowgiphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_author_visible" to "optionsAllowauthorvisible"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_multiple_votes" to "optionsAllowmultiplevotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_self_voting" to "optionsAllowselfvoting"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_allow_actions" to "optionsAllowactions"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_max_posts" to "optionsMaxposts"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_max_down_votes" to "optionsMaxdownvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "options_max_up_votes" to "optionsMaxupvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" RENAME COLUMN "created_by_id" to "createdById"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "default_template_id" to "defaultTemplateId"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "slack_team_id" to "slackTeamId"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "slack_user_id" to "slackUserId"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "stripe_id" to "stripeId"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "user_id" to "userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "email_verification" to "emailVerification"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" RENAME COLUMN "account_type" to "accountType"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" RENAME COLUMN "owner_id" TO "ownerId"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" RENAME COLUMN "template_id" TO "templateId"`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" RENAME COLUMN "session_id" TO "sessionId"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d50229c10adbf294a228c35cb1" ON "visitors" ("usersId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_89c90edf2f369cfbcb220d2e09" ON "visitors" ("sessionsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_331400b3a08ee505d42ddba1db" ON "subscriptions" ("ownerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d10acbe503da4c56853181efc9" ON "posts" ("groupId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae05faaa55c866130abef6e1fe" ON "posts" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_764b665f832e28c01595ec15cf" ON "posts" ("sessionId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5b05adc89dda0614276a13a59" ON "votes" ("postId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5169384e31d0989699a318f3ca" ON "votes" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d26fe2e6102cd9c47650a0d7a6" ON "sessions" ("createdById") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4838cd4fc48a6ff2d4aa01aa64" ON "messages" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_066163c46cda7e8187f96bc87a" ON "messages" ("sessionId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ad140fba0b4ad9559e6530282" ON "groups" ("sessionId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_898cf6af34722df13f760cc364" ON "groups" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c58b12b1a7b4012bb238bc2654" ON "templates" ("createdById") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b086b03bb64304390cec7635e" ON "users" ("defaultTemplateId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a10dca6aa6bda5865287bf2792" ON "users_identities" ("userId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3c67bd4e6a014698751d9242e3" ON "users_identities" ("accountType", "username") `
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "FK_d50229c10adbf294a228c35cb19" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f" FOREIGN KEY ("sessionsId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_331400b3a08ee505d42ddba1db0" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_d10acbe503da4c56853181efc98" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_764b665f832e28c01595ec15cf3" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_b5b05adc89dda0614276a13a599" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_5169384e31d0989699a318f3ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_066163c46cda7e8187f96bc87a0" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_898cf6af34722df13f760cc364f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_9ad140fba0b4ad9559e65302825" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "templates-columns" ADD CONSTRAINT "FK_c96b807f7154ddb4fb7017af12e" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "columns" ADD CONSTRAINT "FK_37907d102f38ece687182bf5237" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD CONSTRAINT "FK_c58b12b1a7b4012bb238bc26542" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_5b086b03bb64304390cec7635ec" FOREIGN KEY ("defaultTemplateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" ADD CONSTRAINT "FK_a10dca6aa6bda5865287bf2792a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    /**
     * VIEWS
     */

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'user_view', 'public']
    );
    await queryRunner.query(`DROP VIEW "user_view"`);
    await queryRunner.query(`CREATE VIEW "user_view" AS select 
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
left join subscriptions s3 on s3.domain = split_part(u.email, '@', 2) and s3.active is true`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'user_view',
        'select \n  u.id,\n  i.id as "identityId",\n  u.name,\n  i."accountType",\n  i.username,\n  u.currency,\n  u."stripeId",\n  i.photo,\n  u.language,\n  u.email,\n  case when i."accountType" = \'anonymous\' and i.password is null then false else true end as "canDeleteSession",\n  u.trial,\n  s.id as "ownSubscriptionsId",\n  s.plan as "ownPlan",\n  coalesce(s.id, s2.id, s3.id) as "subscriptionsId",\n  coalesce(s.active, s2.active, s3.active, false) as "pro",\n  coalesce(s.plan, s2.plan, s3.plan) as "plan",\n  coalesce(s.domain, s2.domain, s3.domain) as "domain"\nfrom users_identities i\n\njoin users u on u.id = i."userId"\nleft join subscriptions s on s."ownerId" = u.id and s.active is true\nleft join subscriptions s2 on lower(u.email) = any(lower(s2.members::text)::text[]) and s2.active is true\nleft join subscriptions s3 on s3.domain = split_part(u.email, \'@\', 2) and s3.active is true',
      ]
    );

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'session_view', 'public']
    );
    await queryRunner.query(`DROP VIEW "session_view"`);
    await queryRunner.query(`CREATE VIEW "session_view" AS select 
	s.id,
	s.name,
	s.created,
	(
		select to_jsonb(cb) from (
			select cbu.id, cbu.name, cbu.photo from users cbu
			where cbu.id = s."createdById"
		) as cb
	) as "createdBy",
	s.encrypted,
	s.locked,
	(select count(*) from posts p where p."sessionId" = s.id and p.action is not null) as "numberOfActions",	
	(select count(*) from posts p where p."sessionId" = s.id) as "numberOfPosts",
	(
		select count(*) from votes vv
		left join posts vp on vp.id = vv."postId"
		where vp."sessionId" = s.id
	) as "numberOfVotes",
	(
		select json_agg(vis) from (
			select vu.id, vu.name, vu.photo from visitors v
			join users vu on vu.id = v."usersId"
			where v."sessionsId" = s.id
		) as vis
	) as participants

from sessions s
left join users u on s."createdById" = u.id

order by s.updated desc`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'session_view',
        'select \n\ts.id,\n\ts.name,\n\ts.created,\n\t(\n\t\tselect to_jsonb(cb) from (\n\t\t\tselect cbu.id, cbu.name, cbu.photo from users cbu\n\t\t\twhere cbu.id = s."createdById"\n\t\t) as cb\n\t) as "createdBy",\n\ts.encrypted,\n\ts.locked,\n\t(select count(*) from posts p where p."sessionId" = s.id and p.action is not null) as "numberOfActions",\t\n\t(select count(*) from posts p where p."sessionId" = s.id) as "numberOfPosts",\n\t(\n\t\tselect count(*) from votes vv\n\t\tleft join posts vp on vp.id = vv."postId"\n\t\twhere vp."sessionId" = s.id\n\t) as "numberOfVotes",\n\t(\n\t\tselect json_agg(vis) from (\n\t\t\tselect vu.id, vu.name, vu.photo from visitors v\n\t\t\tjoin users vu on vu.id = v."usersId"\n\t\t\twhere v."sessionsId" = s.id\n\t\t) as vis\n\t) as participants\n\nfrom sessions s\nleft join users u on s."createdById" = u.id\n\norder by s.updated desc',
      ]
    );
  }
}
