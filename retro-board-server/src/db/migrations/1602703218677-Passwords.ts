import {MigrationInterface, QueryRunner} from "typeorm";

export class Passwords1602703218677 implements MigrationInterface {
    name = 'Passwords1602703218677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
