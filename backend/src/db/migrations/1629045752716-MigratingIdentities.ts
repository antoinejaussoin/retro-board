import { MigrationInterface, QueryRunner } from 'typeorm';

type UserIds = {
  email: string;
  ids: string[];
};

type Table = {
  name: string;
  col: string;
};

const tables: Table[] = [
  { name: 'groups', col: 'userId' },
  { name: 'posts', col: 'userId' },
  { name: 'sessions', col: 'createdById' },
  { name: 'subscriptions', col: 'ownerId' },
  { name: 'templates', col: 'createdById' },
  { name: 'votes', col: 'userId' },
  { name: 'users_identities', col: 'userId' },
];

const importantFields = ['stripeId', 'currency', 'defaultTemplateId', 'trial'];

export class MigratingIdentities1629045752716 implements MigrationInterface {
  name = 'MigratingIdentities1629045752716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`insert into users_identities
				select uuid_in(md5(random()::text || clock_timestamp()::text)::cstring), "accountType", "username", "password", "emailVerification", "created", "updated", "id", "photo" from users`);

    const duplicatedEmails = await queryRunner.query(`
		select sub.email, array(select id from users where email = sub.email ) as ids from (
			select count(*) as cnt, email from users
			group by email
		) as sub
		where sub.cnt > 1 and email is not null		
		`);
    const emails: UserIds[] = duplicatedEmails.map((e: any) => ({
      email: e.email,
      ids: e.ids,
    }));
    console.log('Found', emails.length, 'emails');
    let count = 0;
    for (const user of emails) {
      count++;
      console.log(
        ' ==> Dealing with ',
        user.email,
        count,
        'out of',
        emails.length
      );
      const allUsersQuery = `select * from users where id in ('${user.ids.join(
        "', '"
      )}')`;
      const allUsers = await queryRunner.query(allUsersQuery);

      const [mainId, ...otherIds] = user.ids;

      // Reset main user with some properties from secondary users
      for (const field of importantFields) {
        const usableValues = allUsers
          .map((u: any) => u[field])
          .filter((v: any) => !!v);
        if (usableValues.length) {
          const query =
            usableValues[0] instanceof Date
              ? `update users set "${field}" = '${usableValues[0].toISOString()}' where id = '${mainId}'`
              : `update users set "${field}" = '${usableValues[0]}' where id = '${mainId}'`;
          await queryRunner.query(query);
        }
      }

      // Re-set all entities to main user
      for (const id of otherIds) {
        for (const table of tables) {
          try {
            const query = `update ${table.name} set "${table.col}" = '${mainId}' where "${table.col}" = '${id}'`;
            await queryRunner.query(query);
          } catch (e) {
            console.log('Ignoring error', e);
          }

          // TODO: try and copy stripeId, currency, trial etc.
        }

        // Special case for visitors
        const result = await queryRunner.query(`
        select "sessionsId" from visitors where "usersId" = '${id}'
        `);

        const sessionIds = result.map(
          (s: { sessionsId: string }) => s.sessionsId
        );

        // Add new visitors
        for (const sessionId of sessionIds) {
          const query = `insert into visitors ("sessionsId", "usersId") values ('${sessionId}', '${mainId}') on conflict do nothing`;
          await queryRunner.query(query);
        }

        // Delete visitors
        const query = `delete from visitors where "usersId" = '${id}'`;
        await queryRunner.query(query);

        // Delete old user
        const delQuery = `delete from users where id = '${id}'`;
        await queryRunner.query(delQuery);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from users_identities`);
  }
}
