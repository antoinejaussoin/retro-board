import { MigrationInterface, QueryRunner } from "typeorm";

export class TimerOptions1674905786619 implements MigrationInterface {
    name = 'TimerOptions1674905786619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_timer" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "options_timer_duration" numeric NOT NULL DEFAULT '900'`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_timer" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "options_timer_duration" numeric NOT NULL DEFAULT '900'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "options_timer_duration"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "options_allow_timer"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "options_timer_duration"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "options_allow_timer"`);
    }

}
