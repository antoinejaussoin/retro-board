import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueEmail1629059231723 implements MigrationInterface {
    name = 'UniqueEmail1629059231723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "public"."users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    }

}
