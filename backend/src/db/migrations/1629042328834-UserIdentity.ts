import {MigrationInterface, QueryRunner} from "typeorm";

export class UserIdentity1629042328834 implements MigrationInterface {
    name = 'UserIdentity1629042328834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_identities" ("id" character varying NOT NULL, "accountType" character varying NOT NULL DEFAULT 'anonymous', "username" character varying, "password" character varying, "emailVerification" character varying, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" character varying, CONSTRAINT "PK_2f798ffcbaa58ad651b989e8825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3c67bd4e6a014698751d9242e3" ON "users_identities" ("username", "accountType") `);
        await queryRunner.query(`ALTER TABLE "users_identities" ADD CONSTRAINT "FK_a10dca6aa6bda5865287bf2792a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_identities" DROP CONSTRAINT "FK_a10dca6aa6bda5865287bf2792a"`);
        await queryRunner.query(`DROP INDEX "IDX_3c67bd4e6a014698751d9242e3"`);
        await queryRunner.query(`DROP TABLE "users_identities"`);
    }

}
