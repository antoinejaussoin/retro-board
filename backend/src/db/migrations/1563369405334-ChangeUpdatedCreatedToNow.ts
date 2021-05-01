import {MigrationInterface, QueryRunner} from "typeorm";

export class test21563369405334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "updated" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "updated" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "updated" SET DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "created" SET DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "updated" SET DEFAULT '2000-01-01 00:00:00+00'`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "created" SET DEFAULT '2000-01-01 00:00:00+00'`);
    }

}
