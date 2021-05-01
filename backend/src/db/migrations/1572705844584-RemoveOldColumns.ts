import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveOldColumns1572705844584 implements MigrationInterface {
    name = 'RemoveOldColumns1572705844584'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "postType"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "postType" character varying NOT NULL`, undefined);
    }

}
