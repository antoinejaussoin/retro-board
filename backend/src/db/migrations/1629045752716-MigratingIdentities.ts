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
  { name: 'visitors', col: 'usersId' },
  { name: 'votes', col: 'userId' },
];

export class MigratingIdentities1629045752716 implements MigrationInterface {
  name = 'MigratingIdentities1629045752716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from users_identities`);
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

    emails.forEach((user) => {
      console.log(' ==> Dealing with ', user.email);
      const [mainId, ...otherIds] = user.ids;
      otherIds.forEach(async (id) => {
        tables.forEach(async (table) => {
          const query = `update ${table.name} set ${table.col} = ${mainId} where ${table.col} = ${id}`;
          // await queryRunner.query(query);
          console.log(query);

          // TODO: try and copy stripeId, currency, trial etc.
        });
      });
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from users_identities`);
  }
}
