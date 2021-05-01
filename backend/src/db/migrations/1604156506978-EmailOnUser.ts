import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailOnUser1604156506978 implements MigrationInterface {
    name = 'EmailOnUser1604156506978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    }

}
