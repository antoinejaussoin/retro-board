import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoBackToUser1629222818292 implements MigrationInterface {
  name = 'AddPhotoBackToUser1629222818292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."users" ADD "photo" character varying`
    );

    await queryRunner.query(`
        update users set photo = sub.photo
        from (
            select distinct on (i."userId") i."userId", photo
            from users_identities i
            where i.photo is not null
        ) as sub
        where users.id = sub."userId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "photo"`);
  }
}
