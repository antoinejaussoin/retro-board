import {MigrationInterface, QueryRunner} from "typeorm";

export class ColumnDefinitions1572708796385 implements MigrationInterface {
    name = 'ColumnDefinitions1572708796385'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "columns" ("id" character varying NOT NULL, "type" character varying NOT NULL, "index" integer NOT NULL, "label" character varying NOT NULL, "color" character varying NOT NULL, "icon" character varying, "sessionId" character varying NOT NULL, CONSTRAINT "PK_4ac339ccbbfed1dcd96812abbd5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ADD CONSTRAINT "FK_37907d102f38ece687182bf5237" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "columns" DROP CONSTRAINT "FK_37907d102f38ece687182bf5237"`, undefined);
        await queryRunner.query(`DROP TABLE "columns"`, undefined);
    }

}
