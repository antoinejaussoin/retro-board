import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPhoto1629045752715 implements MigrationInterface {
    name = 'AddPhoto1629045752715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users_identities" ADD "photo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users_identities" DROP COLUMN "photo"`);
    }

}
