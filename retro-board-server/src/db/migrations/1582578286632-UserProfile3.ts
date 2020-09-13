import {MigrationInterface, QueryRunner} from "typeorm";

export class UserProfile31582578286632 implements MigrationInterface {
    name = 'UserProfile31582578286632'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created"`, undefined);
    }

}
