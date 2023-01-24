import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowCancelVote1674589758156 implements MigrationInterface {
    name = 'AllowCancelVote1674589758156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "options_allow_cancel_vote" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "options_allow_cancel_vote" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "options_allow_cancel_vote"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "options_allow_cancel_vote"`);
    }

}
