import {MigrationInterface, QueryRunner} from "typeorm";

export class Templates21584200581240 implements MigrationInterface {
    name = 'Templates21584200581240'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "templates-columns" ("id" character varying NOT NULL, "type" character varying NOT NULL, "index" integer NOT NULL, "label" character varying NOT NULL, "color" character varying NOT NULL, "icon" character varying, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "templateId" character varying NOT NULL, CONSTRAINT "PK_1cb34b1c28a611073a0054cec6b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "templates-columns" ADD CONSTRAINT "FK_c96b807f7154ddb4fb7017af12e" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "templates-columns" DROP CONSTRAINT "FK_c96b807f7154ddb4fb7017af12e"`, undefined);
        await queryRunner.query(`DROP TABLE "templates-columns"`, undefined);
    }

}
