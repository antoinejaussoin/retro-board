import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveCount1573156845706 implements MigrationInterface {
    name = 'RemoveCount1573156845706'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "count"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" ADD "count" integer NOT NULL DEFAULT 0`, undefined);
    }

}
