import { MigrationInterface, QueryRunner } from "typeorm";

export class TimerOnSession1674905273870 implements MigrationInterface {
    name = 'TimerOnSession1674905273870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "timer" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "timer"`);
    }

}
