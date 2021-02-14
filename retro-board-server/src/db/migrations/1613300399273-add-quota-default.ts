import { MigrationInterface, QueryRunner } from 'typeorm';

export class addQuotaDefault1613300399273 implements MigrationInterface {
  name = 'addQuotaDefault1613300399273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "quota" integer NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "quota"`);
  }
}
