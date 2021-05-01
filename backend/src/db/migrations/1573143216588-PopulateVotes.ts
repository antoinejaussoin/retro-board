import {MigrationInterface, QueryRunner} from "typeorm";

export class PopulateVotes1573143216588 implements MigrationInterface {
    name = 'PopulateVotes1573143216588'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "votes" ("count", "type", "userId", "postId") select 1, 'like', "usersId", "postsId" from "posts-likes"`, undefined);
        await queryRunner.query(`INSERT INTO "votes" ("count", "type", "userId", "postId") select 1, 'dislike', "usersId", "postsId" from "posts-dislikes"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "posts-dislikes" ("postsId", "usersId") select "postId", "userId" from "votes" where "type" = 'dislike'`, undefined);
        await queryRunner.query(`INSERT INTO "posts-likes" ("postsId", "usersId") select "postId", "userId" from "votes" where "type" = 'like'`, undefined);
        await queryRunner.query(`DELETE FROM "votes"`, undefined);
    }

}
