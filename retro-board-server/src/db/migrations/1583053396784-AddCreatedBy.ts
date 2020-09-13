import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedBy1583053396784 implements MigrationInterface {
    name = 'AddCreatedBy1583053396784'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO users (id, name, "accountType", username, photo, created, updated) values ('unknown-user', 'Unknown User', 'anonymous', null, null, NOW(), NOW())`);
        // await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UNIQUE_username_accountType" UNIQUE ("username", "accountType")`)
        await queryRunner.query(`ALTER TABLE "sessions" ADD "createdById" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "createdById" = 'unknown-user'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`UPDATE "sessions" SET "createdById" = null`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "createdById"`, undefined);
        // await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UNIQUE_username_accountType"`)
        await queryRunner.query(`DELETE FROM users where id = 'unknown-user'`)
    }

}
