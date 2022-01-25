import { MigrationInterface, QueryRunner } from 'typeorm';

export class MissingIndices1643116159073 implements MigrationInterface {
  name = 'MissingIndices1643116159073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_9f5aedb06b838d50b1b4a56e04" ON "columns" ("session_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d169517f9e0e1b10bac42c215" ON "templates_columns" ("template_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db22f6defb263cc5b40a39847b" ON "licences" ("email") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db22f6defb263cc5b40a39847b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d169517f9e0e1b10bac42c215"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f5aedb06b838d50b1b4a56e04"`
    );
  }
}
