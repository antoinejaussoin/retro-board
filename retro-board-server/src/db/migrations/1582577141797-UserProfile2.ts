import {MigrationInterface, QueryRunner} from "typeorm";

export class UserProfile21582577141797 implements MigrationInterface {
    name = 'UserProfile21582577141797'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_b5b05adc89dda0614276a13a599"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "accountType" character varying NOT NULL DEFAULT 'anonymous'`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ADD "photo" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_b5b05adc89dda0614276a13a599" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_b5b05adc89dda0614276a13a599"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountType"`, undefined);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_b5b05adc89dda0614276a13a599" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }
}
