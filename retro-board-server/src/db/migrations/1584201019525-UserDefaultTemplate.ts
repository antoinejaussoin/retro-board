import {MigrationInterface, QueryRunner} from "typeorm";

export class UserDefaultTemplate1584201019525 implements MigrationInterface {
    name = 'UserDefaultTemplate1584201019525'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD "defaultTemplateId" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5b086b03bb64304390cec7635ec" FOREIGN KEY ("defaultTemplateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5b086b03bb64304390cec7635ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "defaultTemplateId"`, undefined);
    }

}
