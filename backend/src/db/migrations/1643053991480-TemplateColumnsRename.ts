import { MigrationInterface, QueryRunner } from 'typeorm';

export class TemplateColumnsRename1643053991480 implements MigrationInterface {
  name = 'TemplateColumnsRename1643053991480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templates-columns" RENAME TO "templates_columns"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templates_columns" RENAME TO "templates-columns"`
    );
  }
}
