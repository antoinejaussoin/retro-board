import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionAdmins1669662836558 implements MigrationInterface {
  name = 'SubscriptionAdmins1669662836558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "admins" text array NOT NULL DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "admins"`);
  }
}
