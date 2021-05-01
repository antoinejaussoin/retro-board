import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOptions1571597571363 implements MigrationInterface {
    name = 'AddOptions1571597571363'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "maxUpVotes" numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "maxDownVotes" numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowActions" boolean NOT NULL DEFAULT true`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowActions"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "maxDownVotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "maxUpVotes"`, undefined);
    }

}
