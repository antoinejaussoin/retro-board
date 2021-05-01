import {MigrationInterface, QueryRunner} from "typeorm";

export class Votes1573077963093 implements MigrationInterface {
    name = 'Votes1573077963093'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "votes" ("id" character varying NOT NULL, "count" integer NOT NULL DEFAULT 0, "type" character varying NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "postId" character varying NOT NULL, CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ADD "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" ADD "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_5169384e31d0989699a318f3ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_b5b05adc89dda0614276a13a599" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_b5b05adc89dda0614276a13a599"`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_5169384e31d0989699a318f3ca4"`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" DROP COLUMN "updated"`, undefined);
        await queryRunner.query(`ALTER TABLE "columns" DROP COLUMN "created"`, undefined);
        await queryRunner.query(`DROP TABLE "votes"`, undefined);
    }

}
