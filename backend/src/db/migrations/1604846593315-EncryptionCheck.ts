import {MigrationInterface, QueryRunner} from "typeorm";

export class EncryptionCheck1604846593315 implements MigrationInterface {
    name = 'EncryptionCheck1604846593315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "encrypted" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "encrypted"`);
    }

}
