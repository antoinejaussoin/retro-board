import {MigrationInterface, QueryRunner} from "typeorm";

export class RemovePermaGiphy1586699835290 implements MigrationInterface {
    name = 'RemovePermaGiphy1586699835290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsAllowpermagiphy"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowpermagiphy"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowpermagiphy" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsAllowpermagiphy" boolean NOT NULL DEFAULT false`, undefined);
    }

}
