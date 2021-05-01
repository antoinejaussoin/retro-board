import {MigrationInterface, QueryRunner} from "typeorm";

export class UserLanguage1583168991232 implements MigrationInterface {
    name = 'UserLanguage1583168991232'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD "language" character varying NOT NULL DEFAULT 'en'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "language"`, undefined);
    }

}
