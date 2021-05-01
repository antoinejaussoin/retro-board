import {MigrationInterface, QueryRunner} from "typeorm";

export class Lexorank1584999977293 implements MigrationInterface {
    name = 'Lexorank1584999977293'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" ADD "rank" character varying NOT NULL DEFAULT '0|hzzzzz:'`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" ADD "rank" character varying NOT NULL DEFAULT '0|hzzzzz:'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "rank"`, undefined);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "rank"`, undefined);
    }

}
