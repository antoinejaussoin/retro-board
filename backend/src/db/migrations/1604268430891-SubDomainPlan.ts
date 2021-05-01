import {MigrationInterface, QueryRunner} from "typeorm";

export class SubDomainPlan1604268430891 implements MigrationInterface {
    name = 'SubDomainPlan1604268430891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "plan" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "domain" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "domain"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "plan"`);
    }

}
