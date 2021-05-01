import {MigrationInterface, QueryRunner} from "typeorm";

export class SessionOptions1584182574659 implements MigrationInterface {
    name = 'SessionOptions1584182574659'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsMaxupvotes" numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsMaxdownvotes" numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowactions" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowselfvoting" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowmultiplevotes" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "optionsAllowauthorvisible" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsMaxupvotes" = "maxUpVotes"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsMaxdownvotes" = "maxDownVotes"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsAllowactions" = "allowActions"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsAllowselfvoting" = "allowSelfVoting"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsAllowmultiplevotes" = "allowMultipleVotes"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "optionsAllowauthorvisible" = "allowAuthorVisible"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "maxUpVotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "maxDownVotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowActions"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowSelfVoting"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowMultipleVotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "allowAuthorVisible"`, undefined);
        
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowAuthorVisible" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowMultipleVotes" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowSelfVoting" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "allowActions" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "maxDownVotes" numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "maxUpVotes" numeric`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "allowAuthorVisible" = "optionsAllowauthorvisible"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "allowMultipleVotes" = "optionsAllowmultiplevotes"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "allowSelfVoting" = "optionsAllowselfvoting"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "allowActions" = "optionsAllowactions"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "maxDownVotes" = "optionsMaxdownvotes"`, undefined);
        await queryRunner.query(`UPDATE "sessions" SET "maxUpVotes" = "optionsMaxupvotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowauthorvisible"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowmultiplevotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowselfvoting"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsAllowactions"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsMaxdownvotes"`, undefined);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "optionsMaxupvotes"`, undefined);
        
    }

}
