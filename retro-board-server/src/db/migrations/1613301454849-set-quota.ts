import { MigrationInterface, QueryRunner } from 'typeorm';

export class setQuota1613301454849 implements MigrationInterface {
  name = 'setQuota1613301454849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "users"."quota" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "quota" SET DEFAULT '50'`
    );
    await queryRunner.query(`update users set quota = 50`);
    await queryRunner.query(`update users u2 set quota = new_quota from
        (
        select u.id, GREATEST(cast(count(p.*) as int) + 30, 50) as new_quota from users u
        join posts p on u.id = p."userId"
        group by u.id
        ) as sub
        where u2.id = sub.id`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "quota" SET DEFAULT '0'`
    );
    await queryRunner.query(`COMMENT ON COLUMN "users"."quota" IS NULL`);
  }
}
