import {MigrationInterface, QueryRunner} from "typeorm";

export class Votes21573078141434 implements MigrationInterface {
    name = 'Votes21573078141434'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE SEQUENCE "votes_id_seq" OWNED BY "votes"."id"`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ALTER COLUMN "id" SET DEFAULT nextval('votes_id_seq')`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" ALTER COLUMN "id" DROP DEFAULT`, undefined);
        await queryRunner.query(`DROP SEQUENCE "votes_id_seq"`, undefined);
    }

}
