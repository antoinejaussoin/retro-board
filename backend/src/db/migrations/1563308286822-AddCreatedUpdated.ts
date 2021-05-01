import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedUpdated1563308286822 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2000-01-01 00:00:00+00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "created"`);
    }

}
