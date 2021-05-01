import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAllowAuthorVisible1573233321103 implements MigrationInterface {
    name = 'AddAllowAuthorVisible1573233321103'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowAuthorVisible" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowAuthorVisible"`, undefined);
    }

}
