import {MigrationInterface, QueryRunner} from "typeorm";

export class Pro1603012996927 implements MigrationInterface {
    name = 'Pro1603012996927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "pro" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "stripeId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripeId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pro"`);
    }

}
