import {MigrationInterface, QueryRunner} from "typeorm";

export class SetDefaultValues1572381846806 implements MigrationInterface {
    name = 'SetDefaultValues1572381846806'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "maxUpVotes" SET DEFAULT null`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "maxDownVotes" SET DEFAULT null`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "maxDownVotes" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "maxUpVotes" DROP DEFAULT`, undefined);
    }

}
