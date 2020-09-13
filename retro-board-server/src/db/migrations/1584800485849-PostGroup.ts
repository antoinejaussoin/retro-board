import {MigrationInterface, QueryRunner} from "typeorm";

export class PostGroup1584800485849 implements MigrationInterface {
    name = 'PostGroup1584800485849'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" character varying NOT NULL, "column" integer NOT NULL DEFAULT 0, "label" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sessionId" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" ADD "groupId" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_9ad140fba0b4ad9559e65302825" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_898cf6af34722df13f760cc364f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d10acbe503da4c56853181efc98" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d10acbe503da4c56853181efc98"`, undefined);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_898cf6af34722df13f760cc364f"`, undefined);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_9ad140fba0b4ad9559e65302825"`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "groupId"`, undefined);
        await queryRunner.query(`DROP TABLE "groups"`, undefined);
    }

}
