import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOldVotes1573143457302 implements MigrationInterface {
  name = 'RemoveOldVotes1573143457302';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "posts-likes"`, undefined);
    await queryRunner.query(`DROP TABLE "posts-dislikes"`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
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
}
