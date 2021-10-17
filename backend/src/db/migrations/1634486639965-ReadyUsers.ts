import {MigrationInterface, QueryRunner} from "typeorm";

export class ReadyUsers1634486639965 implements MigrationInterface {
    name = 'ReadyUsers1634486639965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "ready" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "ready"`);
    }

}
