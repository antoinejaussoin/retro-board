import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCustomColumns1572704989505 implements MigrationInterface {
    name = 'AddCustomColumns1572704989505'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "column" integer NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`UPDATE "posts" SET "column" = 0 WHERE "postType" = 'well'`, undefined);
        await queryRunner.query(`UPDATE "posts" SET "column" = 1 WHERE "postType" = 'notWell'`, undefined);
        await queryRunner.query(`UPDATE "posts" SET "column" = 2 WHERE "postType" = 'ideas'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`UPDATE "posts" SET "postType" = 'well' WHERE "column" = 0`, undefined);
        await queryRunner.query(`UPDATE "posts" SET "postType" = 'notWell' WHERE "column" = 1`, undefined);
        await queryRunner.query(`UPDATE "posts" SET "postType" = 'ideas' WHERE "column" = 2`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "column"`, undefined);
    }

}
