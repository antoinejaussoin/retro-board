import {MigrationInterface, QueryRunner} from "typeorm";

export class ColumnDefinitionsCreate1572720263441 implements MigrationInterface {
    name = 'ColumnDefinitionsCreate1572720263441'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "columns" (type, index, label, color, icon, "sessionId") select 'well', 0, '', '', '', "id" from sessions`, undefined);
        await queryRunner.query(`INSERT INTO "columns" (type, index, label, color, icon, "sessionId") select 'notWell', 1, '', '', '', "id" from sessions`, undefined);
        await queryRunner.query(`INSERT INTO "columns" (type, index, label, color, icon, "sessionId") select 'ideas', 2, '', '', '', "id" from sessions`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "columns"`, undefined);
    }

}
