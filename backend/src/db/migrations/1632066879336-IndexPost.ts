import {MigrationInterface, QueryRunner} from "typeorm";

export class IndexPost1632066879336 implements MigrationInterface {
    name = 'IndexPost1632066879336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_764b665f832e28c01595ec15cf" ON "public"."posts" ("sessionId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_764b665f832e28c01595ec15cf"`);
    }

}
