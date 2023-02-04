import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDefaults1675515259530 implements MigrationInterface {
    name = 'ChangeDefaults1675515259530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "options_allow_cancel_vote" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "options_allow_timer" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "options_allow_cancel_vote" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "options_allow_timer" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "options_allow_timer" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "options_allow_cancel_vote" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "options_allow_timer" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "options_allow_cancel_vote" SET DEFAULT true`);
    }

}
