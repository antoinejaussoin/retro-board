import {MigrationInterface, QueryRunner} from "typeorm";

export class SubscriptionActive1603742014444 implements MigrationInterface {
    name = 'SubscriptionActive1603742014444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" RENAME COLUMN "status" TO "active"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "active" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "active" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "subscriptions" RENAME COLUMN "active" TO "status"`);
    }

}
