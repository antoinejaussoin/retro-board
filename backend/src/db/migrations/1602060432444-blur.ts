import {MigrationInterface, QueryRunner} from "typeorm";

export class blur1602060432444 implements MigrationInterface {
    name = 'blur1602060432444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsBlurcards" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsBlurcards" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsBlurcards"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsBlurcards"`);
    }

}
