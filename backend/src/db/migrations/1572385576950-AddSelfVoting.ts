import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSelfVoting1572385576950 implements MigrationInterface {
    name = 'AddSelfVoting1572385576950'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowSelfVoting" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowMultipleVotes" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowMultipleVotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowSelfVoting"`, undefined);
    }

}
