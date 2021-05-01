import {MigrationInterface, QueryRunner} from "typeorm";

export class Subscriptions1603697704984 implements MigrationInterface {
    name = 'Subscriptions1603697704984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" character varying NOT NULL, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriptions-users" ("subscriptionsId" character varying NOT NULL, "usersId" character varying NOT NULL, CONSTRAINT "PK_00cd7f2adab9f3397e5f2edf769" PRIMARY KEY ("subscriptionsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dccc47d20a8793f7bcb417cd57" ON "subscriptions-users" ("subscriptionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b05891b70145228739e2a7b29b" ON "subscriptions-users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_331400b3a08ee505d42ddba1db0" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions-users" ADD CONSTRAINT "FK_dccc47d20a8793f7bcb417cd57e" FOREIGN KEY ("subscriptionsId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions-users" ADD CONSTRAINT "FK_b05891b70145228739e2a7b29b4" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions-users" DROP CONSTRAINT "FK_b05891b70145228739e2a7b29b4"`);
        await queryRunner.query(`ALTER TABLE "subscriptions-users" DROP CONSTRAINT "FK_dccc47d20a8793f7bcb417cd57e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_331400b3a08ee505d42ddba1db0"`);
        await queryRunner.query(`DROP INDEX "IDX_b05891b70145228739e2a7b29b"`);
        await queryRunner.query(`DROP INDEX "IDX_dccc47d20a8793f7bcb417cd57"`);
        await queryRunner.query(`DROP TABLE "subscriptions-users"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
