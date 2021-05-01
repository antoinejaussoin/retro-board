import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveAutogenIDs1575488936576 implements MigrationInterface {
    name = 'RemoveAutogenIDs1575488936576'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" ALTER COLUMN "id" DROP DEFAULT`, undefined);
        await queryRunner.query(`DROP SEQUENCE "votes_id_seq"`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ALTER COLUMN "id" DROP DEFAULT`, undefined);
        await queryRunner.query(`DROP SEQUENCE "columns_id_seq"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE SEQUENCE "columns_id_seq" OWNED BY "columns"."id"`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ALTER COLUMN "id" SET DEFAULT nextval('columns_id_seq')`, undefined);
        await queryRunner.query(`CREATE SEQUENCE "votes_id_seq" OWNED BY "votes"."id"`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ALTER COLUMN "id" SET DEFAULT nextval('votes_id_seq')`, undefined);
    }

}
