import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1563180728495 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const hasTable = await queryRunner.hasTable('sessions');
    // Abort if the initial tables were already there (from v2.0.0)
    if (hasTable) {
      return;
    }
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" character varying NOT NULL, "name" character varying, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac984ccbd8b01af155e1874e8c" ON "sessions" ("name") `
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" character varying NOT NULL, "postType" character varying NOT NULL, "content" character varying NOT NULL, "sessionId" character varying, "userId" character varying, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "posts-likes" ("postsId" character varying NOT NULL, "usersId" character varying NOT NULL, CONSTRAINT "PK_3af5c1c14ed70366af0fb0b6f2b" PRIMARY KEY ("postsId", "usersId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abcc8f1b7f831ac9628c046844" ON "posts-likes" ("postsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd92dae15e41a077de24f88b80" ON "posts-likes" ("usersId") `
    );
    await queryRunner.query(
      `CREATE TABLE "posts-dislikes" ("postsId" character varying NOT NULL, "usersId" character varying NOT NULL, CONSTRAINT "PK_9938b66b4e2497cad0cf1a66d46" PRIMARY KEY ("postsId", "usersId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9384267f02386d788a48da7fe1" ON "posts-dislikes" ("postsId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4907b084ed752c03e957b0235" ON "posts-dislikes" ("usersId") `
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_764b665f832e28c01595ec15cf3" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-likes" ADD CONSTRAINT "FK_abcc8f1b7f831ac9628c0468441" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-likes" ADD CONSTRAINT "FK_fd92dae15e41a077de24f88b801" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-dislikes" ADD CONSTRAINT "FK_9384267f02386d788a48da7fe14" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-dislikes" ADD CONSTRAINT "FK_e4907b084ed752c03e957b0235c" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "posts-dislikes" DROP CONSTRAINT "FK_e4907b084ed752c03e957b0235c"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-dislikes" DROP CONSTRAINT "FK_9384267f02386d788a48da7fe14"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-likes" DROP CONSTRAINT "FK_fd92dae15e41a077de24f88b801"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts-likes" DROP CONSTRAINT "FK_abcc8f1b7f831ac9628c0468441"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_764b665f832e28c01595ec15cf3"`
    );
    await queryRunner.query(`DROP INDEX "IDX_e4907b084ed752c03e957b0235"`);
    await queryRunner.query(`DROP INDEX "IDX_9384267f02386d788a48da7fe1"`);
    await queryRunner.query(`DROP TABLE "posts-dislikes"`);
    await queryRunner.query(`DROP INDEX "IDX_fd92dae15e41a077de24f88b80"`);
    await queryRunner.query(`DROP INDEX "IDX_abcc8f1b7f831ac9628c046844"`);
    await queryRunner.query(`DROP TABLE "posts-likes"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP INDEX "IDX_51b8b26ac168fbe7d6f5653e6c"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "IDX_ac984ccbd8b01af155e1874e8c"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
