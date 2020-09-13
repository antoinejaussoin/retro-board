import {MigrationInterface, QueryRunner} from "typeorm";

export class LexorankIndex1585000111311 implements MigrationInterface {
    name = 'LexorankIndex1585000111311'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE INDEX "IDX_9d73f4eb34c2b6b8f802977095" ON "groups" ("rank") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_0253a73663519dde3f8ad81ef4" ON "posts" ("rank") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_0253a73663519dde3f8ad81ef4"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_9d73f4eb34c2b6b8f802977095"`, undefined);
    }

}
