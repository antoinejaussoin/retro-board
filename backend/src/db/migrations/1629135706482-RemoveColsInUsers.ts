import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColsInUsers1629135706482 implements MigrationInterface {
  name = 'RemoveColsInUsers1629135706482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5d57c15d430d9964131201079"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b5d57c15d430d9964131201079" ON "public"."users" ("accountType", "username") `
    );
  }
}
