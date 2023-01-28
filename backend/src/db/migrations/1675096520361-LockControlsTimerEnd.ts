import { MigrationInterface, QueryRunner } from "typeorm";

export class LockControlsTimerEnd1675096520361 implements MigrationInterface {
    name = 'LockControlsTimerEnd1675096520361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "options_readonly_on_timer_end" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "options_readonly_on_timer_end" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "options_readonly_on_timer_end"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "options_readonly_on_timer_end"`);
    }

}
