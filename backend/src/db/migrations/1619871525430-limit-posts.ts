import {MigrationInterface, QueryRunner} from "typeorm";

export class limitPosts1619871525430 implements MigrationInterface {
    name = 'limitPosts1619871525430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsMaxposts" numeric`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsMaxposts" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsMaxposts"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsMaxposts"`);
    }

}
