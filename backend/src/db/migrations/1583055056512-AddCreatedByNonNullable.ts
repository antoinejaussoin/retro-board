import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByNonNullable1583055056512 implements MigrationInterface {
    name = 'AddCreatedByNonNullable1583055056512'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "createdById" SET NOT NULL`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b5d57c15d430d9964131201079" ON "users" ("username", "accountType") `, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_b5d57c15d430d9964131201079"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "createdById" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_d26fe2e6102cd9c47650a0d7a6f" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
