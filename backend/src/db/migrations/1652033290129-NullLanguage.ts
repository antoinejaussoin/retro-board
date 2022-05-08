import {MigrationInterface, QueryRunner} from "typeorm";

export class NullLanguage1652033290129 implements MigrationInterface {
    name = 'NullLanguage1652033290129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en-GB'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "language" SET NOT NULL`);
    }

}
