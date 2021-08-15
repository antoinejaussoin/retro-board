import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratingIdentities1629042328835 implements MigrationInterface {
  name = 'MigratingIdentities1629042328835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from users_identities`);
    await queryRunner.query(`insert into users_identities
				select uuid_in(md5(random()::text || clock_timestamp()::text)::cstring), "accountType", "username", "password", "emailVerification", "created", "updated", "id" from users`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from user_identities`);
  }
}
