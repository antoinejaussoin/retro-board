import {MigrationInterface, QueryRunner} from "typeorm";

export class Giphy1584117892452 implements MigrationInterface {
    name = 'Giphy1584117892452'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "giphy" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "giphy"`, undefined);
    }

}
