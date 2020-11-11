import {MigrationInterface, QueryRunner} from "typeorm";

export class Visitors1605115660660 implements MigrationInterface {
    name = 'Visitors1605115660660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "visitors" ("sessionsId" character varying NOT NULL, "usersId" character varying NOT NULL, CONSTRAINT "PK_c16501c34b8530a425739e400bd" PRIMARY KEY ("sessionsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_89c90edf2f369cfbcb220d2e09" ON "visitors" ("sessionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d50229c10adbf294a228c35cb1" ON "visitors" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f" FOREIGN KEY ("sessionsId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_d50229c10adbf294a228c35cb19" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`
        insert into visitors 
	    select distinct "sessionsId", "usersId" from (
            (
                select distinct id as "sessionsId", "createdById" as "usersId" from sessions
            )
            union
            (
                select distinct sessions.id, posts."userId" from sessions 
                left join posts on sessions.id = posts."sessionId"
            )
            union
            (
                select distinct sessions.id, votes."userId" from sessions 
                left join posts on sessions.id = posts."sessionId"
                left join votes on posts.id = votes."postId"

            )
        ) s where "usersId" is not null
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_d50229c10adbf294a228c35cb19"`);
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f"`);
        await queryRunner.query(`DROP INDEX "IDX_d50229c10adbf294a228c35cb1"`);
        await queryRunner.query(`DROP INDEX "IDX_89c90edf2f369cfbcb220d2e09"`);
        await queryRunner.query(`DROP TABLE "visitors"`);
    }

}
