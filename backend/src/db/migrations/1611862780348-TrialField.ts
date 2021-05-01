import {MigrationInterface, QueryRunner} from "typeorm";

export class TrialField1611862780348 implements MigrationInterface {
    name = 'TrialField1611862780348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "trial" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "trial"`);
    }

}
