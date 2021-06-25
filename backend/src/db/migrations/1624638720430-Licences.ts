import {MigrationInterface, QueryRunner} from "typeorm";

export class Licences1624638720430 implements MigrationInterface {
    name = 'Licences1624638720430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f"`);
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_d50229c10adbf294a228c35cb19"`);
        await queryRunner.query(`CREATE TABLE "licences" ("id" character varying NOT NULL, "email" character varying NOT NULL, "key" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_78f76903a7e2d2b2ac378fca8d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "optionsNewpostsfirst" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "optionsNewpostsfirst" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f" FOREIGN KEY ("sessionsId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_d50229c10adbf294a228c35cb19" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_d50229c10adbf294a228c35cb19"`);
        await queryRunner.query(`ALTER TABLE "visitors" DROP CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "optionsNewpostsfirst" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "optionsNewpostsfirst" SET DEFAULT false`);
        await queryRunner.query(`DROP TABLE "licences"`);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_d50229c10adbf294a228c35cb19" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visitors" ADD CONSTRAINT "FK_89c90edf2f369cfbcb220d2e09f" FOREIGN KEY ("sessionsId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
