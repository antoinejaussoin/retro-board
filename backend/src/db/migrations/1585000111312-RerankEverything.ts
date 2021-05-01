import { MigrationInterface, QueryRunner } from 'typeorm';
import { LexoRank } from 'lexorank';

export class RerankEverything1585000111312 implements MigrationInterface {
  name = 'RerankEverything1585000111315';

  public async up(queryRunner: QueryRunner): Promise<any> {
    const res1 = await queryRunner.query('SELECT id FROM sessions');
    const sessionIds = res1.map((r: any) => r.id);
    for (let i = 0; i < sessionIds.length; i++) {
      console.log(`##### SESSION ${i} out of ${sessionIds.length} #####`);
      let current = LexoRank.middle();
      const id = sessionIds[i];
      const res2 = await queryRunner.query(
        `SELECT "id" FROM posts WHERE "sessionId" = '${id}' ORDER BY "created"`
      );
      const postIds = res2.map((r: any) => r.id);
      let updates = '';
      for (let j = 0; j < postIds.length; j++) {
        updates += `UPDATE posts SET "rank" = '${current.toString()}' WHERE "id" = '${
          postIds[j]
        }';`;

        current = current.genNext();
      }
      await queryRunner.query(updates);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
