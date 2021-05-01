import {MigrationInterface, QueryRunner} from "typeorm";

export class Templates1584197076810 implements MigrationInterface {
    name = 'Templates1584197076810'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "templates" ("id" character varying NOT NULL, "name" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdById" character varying NOT NULL, "optionsMaxupvotes" numeric, "optionsMaxdownvotes" numeric, "optionsAllowactions" boolean NOT NULL DEFAULT true, "optionsAllowselfvoting" boolean NOT NULL DEFAULT false, "optionsAllowmultiplevotes" boolean NOT NULL DEFAULT false, "optionsAllowauthorvisible" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_5624219dd33b4644599d4d4b23" ON "templates" ("name") `, undefined);
        await queryRunner.query(`ALTER TABLE "templates" ADD CONSTRAINT "FK_c58b12b1a7b4012bb238bc26542" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT "FK_c58b12b1a7b4012bb238bc26542"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_5624219dd33b4644599d4d4b23"`, undefined);
        await queryRunner.query(`DROP TABLE "templates"`, undefined);
    }

}
