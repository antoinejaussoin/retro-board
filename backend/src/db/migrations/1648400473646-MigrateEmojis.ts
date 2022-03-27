import { MigrationInterface, QueryRunner } from 'typeorm';

type Mapping = {
  from: string;
  to: string;
};

const mappings: Mapping[] = [
  { from: 'satisfied', to: 'grinning' },
  { from: 'disatisfied', to: 'unamused' },
  { from: 'sunny', to: 'sunny' },
  { from: 'announcement', to: 'loudspeaker' },
  { from: 'file', to: 'paperclip' },
  { from: 'money', to: 'dollar' },
  { from: 'renew', to: 'arrows_clockwise' },
  { from: 'play', to: 'arrow_forward' },
  { from: 'pause', to: 'black_square_for_stop' },
  { from: 'fast-forward', to: 'fast_forward' },
  { from: 'liked', to: 'thumbsup' },
  { from: 'books', to: 'book' },
  { from: 'help', to: 'question' },
  { from: 'cocktail', to: 'desert_island' },
  { from: 'boat', to: 'motor_boat' },
  { from: 'link', to: 'linked_paperclips' },
  { from: 'gesture', to: 'wind_blowing_face' },
  { from: 'fitness', to: 'moyai' },
];

export class MigrateEmojis1648400473646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const mapping of mappings) {
      await queryRunner.query(
        `UPDATE templates_columns SET icon = '${mapping.to}' WHERE icon = '${mapping.from}';`
      );
      await queryRunner.query(
        `UPDATE columns SET icon = '${mapping.to}' WHERE icon = '${mapping.from}';`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const mapping of mappings) {
      await queryRunner.query(
        `UPDATE templates_columns SET icon = '${mapping.from}' WHERE icon = '${mapping.to}';`
      );
      await queryRunner.query(
        `UPDATE columns SET icon = '${mapping.from}' WHERE icon = '${mapping.to}';`
      );
    }
  }
}
