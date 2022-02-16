import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserView1604156127611 implements MigrationInterface {
  name = 'UserView1604156127611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pro"`);
    await queryRunner.query(`CREATE VIEW "user_view" AS 
select 
	u.id,
	u.name,
	u."accountType",
	u.username,
	u."stripeId",
	u.photo,
	u.language,
	coalesce(s.id, s2.id) as "subscriptionsId",
	coalesce(s.active, s2.active) as "pro"
from users u 
left join subscriptions s on s."ownerId" = u.id and s.active is true
left join "subscriptions-users" su on su."usersId" = u.id
left join subscriptions s2 on s2.id = su."subscriptionsId" and s2.active is true
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'public',
        'user_view',
        'select \n\tu.id,\n\tu.name,\n\tu."accountType",\n\tu.username,\n\tu."stripeId",\n\tu.photo,\n\tu.language,\n\tcoalesce(s.id, s2.id) as "subscriptionsId",\n\tcoalesce(s.active, s2.active) as "pro"\nfrom users u \nleft join subscriptions s on s."ownerId" = u.id and s.active is true\nleft join "subscriptions-users" su on su."usersId" = u.id\nleft join subscriptions s2 on s2.id = su."subscriptionsId" and s2.active is true',
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['public', 'user_view']
    );
    await queryRunner.query(`DROP VIEW "user_view"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "pro" character varying`);
  }
}
