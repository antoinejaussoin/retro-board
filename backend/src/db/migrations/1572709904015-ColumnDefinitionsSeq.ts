import {MigrationInterface, QueryRunner} from "typeorm";

export class ColumnDefinitionsSeq1572709904015 implements MigrationInterface {
    name = 'ColumnDefinitions21572709904015'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE SEQUENCE "columns_id_seq" OWNED BY "columns"."id"`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ALTER COLUMN "id" SET DEFAULT nextval('columns_id_seq')`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "columns" ALTER COLUMN "id" DROP DEFAULT`, undefined);
        await queryRunner.query(`DROP SEQUENCE "columns_id_seq"`, undefined);
    }

}
