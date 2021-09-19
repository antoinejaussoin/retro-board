import {MigrationInterface, QueryRunner} from "typeorm";

export class IndexEverything1632067126663 implements MigrationInterface {
    name = 'IndexEverything1632067126663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_9ad140fba0b4ad9559e6530282" ON "public"."groups" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_898cf6af34722df13f760cc364" ON "public"."groups" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5169384e31d0989699a318f3ca" ON "public"."votes" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5b05adc89dda0614276a13a59" ON "public"."votes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c58b12b1a7b4012bb238bc2654" ON "public"."templates" ("createdById") `);
        await queryRunner.query(`CREATE INDEX "IDX_331400b3a08ee505d42ddba1db" ON "public"."subscriptions" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a10dca6aa6bda5865287bf2792" ON "public"."users_identities" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5b086b03bb64304390cec7635e" ON "public"."users" ("defaultTemplateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d10acbe503da4c56853181efc9" ON "public"."posts" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae05faaa55c866130abef6e1fe" ON "public"."posts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d26fe2e6102cd9c47650a0d7a6" ON "public"."sessions" ("createdById") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d26fe2e6102cd9c47650a0d7a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae05faaa55c866130abef6e1fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d10acbe503da4c56853181efc9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b086b03bb64304390cec7635e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a10dca6aa6bda5865287bf2792"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_331400b3a08ee505d42ddba1db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c58b12b1a7b4012bb238bc2654"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5b05adc89dda0614276a13a59"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5169384e31d0989699a318f3ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_898cf6af34722df13f760cc364"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ad140fba0b4ad9559e6530282"`);
    }

}
