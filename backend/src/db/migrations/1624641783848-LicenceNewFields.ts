import {MigrationInterface, QueryRunner} from "typeorm";

export class LicenceNewFields1624641783848 implements MigrationInterface {
    name = 'LicenceNewFields1624641783848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "licences" ADD "stripeCustomerId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "licences" ADD "stripeSessionId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "licences" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "licences" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "licences" DROP COLUMN "stripeSessionId"`);
        await queryRunner.query(`ALTER TABLE "licences" DROP COLUMN "stripeCustomerId"`);
    }

}
