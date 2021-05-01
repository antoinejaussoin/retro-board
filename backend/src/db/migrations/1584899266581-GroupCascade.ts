import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupCascade1584899266581 implements MigrationInterface {
    name = 'GroupCascade1584899266581'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d10acbe503da4c56853181efc98"`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d10acbe503da4c56853181efc98" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d10acbe503da4c56853181efc98"`, undefined);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d10acbe503da4c56853181efc98" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
