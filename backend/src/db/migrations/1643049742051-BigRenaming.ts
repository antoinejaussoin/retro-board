import { MigrationInterface, QueryRunner } from 'typeorm';

export class BigRenaming1643049742051 implements MigrationInterface {
  name = 'BigRenaming1643049742051';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "visitors" DROP CONSTRAINT "PK_c16501c34b8530a425739e400bd"`
    );
    // await queryRunner.query(
    //   `ALTER TABLE "visitors" ADD CONSTRAINT "PK_d50229c10adbf294a228c35cb19" PRIMARY KEY ("usersId")`
    // );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "sessionsId" to "sessions_id"`
    );
    // await queryRunner.query(
    //   `ALTER TABLE "visitors" DROP CONSTRAINT "PK_d50229c10adbf294a228c35cb19"`
    // );
    await queryRunner.query(
      `ALTER TABLE "visitors" RENAME COLUMN "usersId" to "users_id"`
    );
    // await queryRunner.query(`ALTER TABLE "users_identities" ADD "account_type" character varying NOT NULL DEFAULT 'anonymous'`);
    // await queryRunner.query(`ALTER TABLE "users_identities" ADD "email_verification" character varying`);
    // await queryRunner.query(`ALTER TABLE "users_identities" ADD "user_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "users" ADD "stripe_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "users" ADD "slack_user_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "users" ADD "slack_team_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "users" ADD "default_template_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "created_by_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_max_up_votes" numeric`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_max_down_votes" numeric`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_max_posts" numeric`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_actions" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_self_voting" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_multiple_votes" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_author_visible" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_giphy" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_grouping" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_reordering" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_blur_cards" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "templates" ADD "options_new_posts_first" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "groups" ADD "session_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "groups" ADD "user_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "messages" ADD "session_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "messages" ADD "user_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "created_by_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_max_up_votes" numeric`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_max_down_votes" numeric`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_max_posts" numeric`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_actions" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_self_voting" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_multiple_votes" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_author_visible" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_giphy" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_grouping" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_reordering" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_blur_cards" boolean NOT NULL DEFAULT false`);
    // await queryRunner.query(`ALTER TABLE "sessions" ADD "options_new_posts_first" boolean NOT NULL DEFAULT true`);
    // await queryRunner.query(`ALTER TABLE "votes" ADD "user_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "votes" ADD "post_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "posts" ADD "session_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "posts" ADD "group_id" character varying`);
    // await queryRunner.query(`ALTER TABLE "posts" ADD "user_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "licences" ADD "stripe_customer_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "licences" ADD "stripe_session_id" character varying NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "visitors" ADD "sessions_id" character varying NOT NULL`);
    // await queryRunner.query(
    //   `ALTER TABLE "visitors" ADD CONSTRAINT "PK_93910938d4f16f57a137da768b3" PRIMARY KEY ("sessions_id")`
    // );
    // await queryRunner.query(`ALTER TABLE "visitors" ADD "users_id" character varying NOT NULL`);
    // await queryRunner.query(
    //   `ALTER TABLE "visitors" DROP CONSTRAINT "PK_93910938d4f16f57a137da768b3"`
    // );
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
      `ALTER TABLE "visitors" ADD CONSTRAINT "PK_93910938d4f16f57a137da768b3" PRIMARY KEY ("sessions_id")`
    );
    await queryRunner.query(`ALTER TABLE "visitors" DROP COLUMN "users_id"`);
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "PK_93910938d4f16f57a137da768b3"`
    );
    await queryRunner.query(`ALTER TABLE "visitors" DROP COLUMN "sessions_id"`);
    await queryRunner.query(
      `ALTER TABLE "licences" DROP COLUMN "stripe_session_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" DROP COLUMN "stripe_customer_id"`
    );
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "group_id"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "session_id"`);
    await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "post_id"`);
    await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_new_posts_first"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_blur_cards"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_reordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_grouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_giphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_author_visible"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_multiple_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_self_voting"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_allow_actions"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_max_posts"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_max_down_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "options_max_up_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP COLUMN "created_by_id"`
    );
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "session_id"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "session_id"`);
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_new_posts_first"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_blur_cards"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_reordering"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_grouping"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_giphy"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_author_visible"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_multiple_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_self_voting"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_allow_actions"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_max_posts"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_max_down_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "options_max_up_votes"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP COLUMN "created_by_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "default_template_id"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "slack_team_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "slack_user_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripe_id"`);
    await queryRunner.query(
      `ALTER TABLE "users_identities" DROP COLUMN "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" DROP COLUMN "email_verification"`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" DROP COLUMN "account_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "usersId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "PK_d50229c10adbf294a228c35cb19" PRIMARY KEY ("usersId")`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "sessionsId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP CONSTRAINT "PK_d50229c10adbf294a228c35cb19"`
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD CONSTRAINT "PK_c16501c34b8530a425739e400bd" PRIMARY KEY ("sessionsId", "usersId")`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" ADD "stripeSessionId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "licences" ADD "stripeCustomerId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "groupId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "userId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "sessionId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD "postId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD "userId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsNewpostsfirst" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsMaxposts" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsBlurcards" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowreordering" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowgrouping" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowgiphy" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowauthorvisible" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowmultiplevotes" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowselfvoting" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsAllowactions" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsMaxdownvotes" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "optionsMaxupvotes" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "createdById" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "userId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "sessionId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "userId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "sessionId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsNewpostsfirst" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsMaxposts" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsBlurcards" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowreordering" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowgrouping" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowgiphy" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowauthorvisible" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowmultiplevotes" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowselfvoting" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsAllowactions" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsMaxdownvotes" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "optionsMaxupvotes" numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD "createdById" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "slackTeamId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "slackUserId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "stripeId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "defaultTemplateId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" ADD "userId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" ADD "emailVerification" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users_identities" ADD "accountType" character varying NOT NULL DEFAULT 'anonymous'`
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
  }
}
