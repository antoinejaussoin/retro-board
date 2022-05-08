import {MigrationInterface, QueryRunner} from "typeorm";

export class DefaultLanguage1652028782451 implements MigrationInterface {
    name = 'DefaultLanguage1652028782451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en-GB'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en'`);
    }

}
