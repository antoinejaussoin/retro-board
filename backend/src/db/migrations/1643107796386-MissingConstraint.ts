import { MigrationInterface, QueryRunner } from 'typeorm';

export class MissingConstraint1643107796386 implements MigrationInterface {
  name = 'MissingConstraint1643107796386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templates_columns" DROP CONSTRAINT "FK_f5ccf851c3134ac587eb4e794d9"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates_columns" ADD CONSTRAINT "FK_6d169517f9e0e1b10bac42c215d" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templates_columns" DROP CONSTRAINT "FK_6d169517f9e0e1b10bac42c215d"`
    );
    await queryRunner.query(
      `ALTER TABLE "templates_columns" ADD CONSTRAINT "FK_f5ccf851c3134ac587eb4e794d9" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
