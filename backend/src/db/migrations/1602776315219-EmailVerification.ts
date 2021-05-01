import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailVerification1602776315219 implements MigrationInterface {
    name = 'EmailVerification1602776315219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerification" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerification"`);
    }

}
