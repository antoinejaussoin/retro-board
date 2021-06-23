import {MigrationInterface, QueryRunner} from "typeorm";

export class NewPostsFirst1624464797775 implements MigrationInterface {
    name = 'NewPostsFirst1624464797775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "optionsNewpostsfirst" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsNewpostsfirst" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsNewpostsfirst"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "optionsNewpostsfirst"`);
    }

}
