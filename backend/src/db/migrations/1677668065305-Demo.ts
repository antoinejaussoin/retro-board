import { MigrationInterface, QueryRunner } from "typeorm";

export class Demo1677668065305 implements MigrationInterface {
    name = 'Demo1677668065305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "demo" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "demo"`);
    }

}
