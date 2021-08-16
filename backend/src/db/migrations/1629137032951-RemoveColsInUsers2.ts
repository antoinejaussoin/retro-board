import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveColsInUsers21629137032951 implements MigrationInterface {
    name = 'RemoveColsInUsers21629137032951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "accountType"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "emailVerification"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "emailVerification" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "photo" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "username" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "accountType" character varying NOT NULL DEFAULT 'anonymous'`);
    }

}
