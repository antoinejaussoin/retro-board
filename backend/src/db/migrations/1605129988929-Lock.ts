import {MigrationInterface, QueryRunner} from "typeorm";

export class Lock1605129988929 implements MigrationInterface {
    name = 'Lock1605129988929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "locked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "locked"`);
    }

}
