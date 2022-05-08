import { MigrationInterface, QueryRunner } from 'typeorm';

type Mapping = { from: string; to: string };

const mappings: Mapping[] = [
  { from: 'ar', to: 'ar-SA' },
  { from: 'de', to: 'de-DE' },
  { from: 'en', to: 'en-GB' },
  { from: 'es', to: 'es-ES' },
  { from: 'fr', to: 'fr-FR' },
  { from: 'hu', to: 'hu-HU' },
  { from: 'it', to: 'it-IT' },
  { from: 'ja', to: 'ja-JP' },
  { from: 'nl', to: 'nl-NL' },
  { from: 'pl', to: 'pl-PL' },
  { from: 'pt', to: 'pt-BR' },
  { from: 'ptbr', to: 'pt-PT' },
  { from: 'ru', to: 'uk-UA' },
  { from: 'zhcn', to: 'zh-CN' },
  { from: 'zhtw', to: 'zh-TW' },
];

export class MigrateLanguages1652023488716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const mapping of mappings) {
      await queryRunner.query(
        `UPDATE users SET language = '${mapping.to}' WHERE language = '${mapping.from}';`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const mapping of mappings) {
      await queryRunner.query(
        `UPDATE users SET language = '${mapping.from}' WHERE language = '${mapping.to}';`
      );
    }
  }
}
