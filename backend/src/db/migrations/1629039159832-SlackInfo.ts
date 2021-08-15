import {MigrationInterface, QueryRunner} from "typeorm";

export class SlackInfo1629039159832 implements MigrationInterface {
    name = 'SlackInfo1629039159832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "slackUserId" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "slackTeamId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "slackTeamId"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "slackUserId"`);
    }

}
