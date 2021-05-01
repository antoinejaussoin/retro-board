import {MigrationInterface, QueryRunner} from "typeorm";

export class MoreOptions1586009266534 implements MigrationInterface {
    name = 'MoreOptions1586009266534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsAllowgiphy" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsAllowpermagiphy" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsAllowgrouping" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsAllowreordering" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowgiphy" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowpermagiphy" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowgrouping" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowreordering" boolean NOT NULL DEFAULT true`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowreordering"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowgrouping"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowpermagiphy"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowgiphy"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsAllowreordering"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsAllowgrouping"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsAllowpermagiphy"`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsAllowgiphy"`, undefined);
    }

}
