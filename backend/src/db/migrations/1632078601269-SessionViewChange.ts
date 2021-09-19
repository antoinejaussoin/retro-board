import {MigrationInterface, QueryRunner} from "typeorm";

export class SessionViewChange1632078601269 implements MigrationInterface {
    name = 'SessionViewChange1632078601269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","session_view"]);
        await queryRunner.query(`DROP VIEW "public"."session_view"`);
        await queryRunner.query(`CREATE VIEW "session_view" AS 
select 
	s.id,
	s.name,
	s.created,
	(
		select to_jsonb(cb) from (
			select cbu.id, cbu.name, cbu.photo from users cbu
			where cbu.id = s."createdById"
		) as cb
	) as "createdBy",
	s.encrypted,
	s.locked,
	(select count(*) from posts p where p."sessionId" = s.id and p.action is not null) as "numberOfActions",	
	(select count(*) from posts p where p."sessionId" = s.id) as "numberOfPosts",
	(
		select count(*) from votes vv
		left join posts vp on vp.id = vv."postId"
		where vp."sessionId" = s.id
	) as "numberOfVotes",
	(
		select json_agg(vis) from (
			select vu.id, vu.name, vu.photo from visitors v
			join users vu on vu.id = v."usersId"
			where v."sessionsId" = s.id
		) as vis
	) as participants

from sessions s
left join users u on s."createdById" = u.id

order by s.updated desc
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","session_view","select \n\ts.id,\n\ts.name,\n\ts.created,\n\t(\n\t\tselect to_jsonb(cb) from (\n\t\t\tselect cbu.id, cbu.name, cbu.photo from users cbu\n\t\t\twhere cbu.id = s.\"createdById\"\n\t\t) as cb\n\t) as \"createdBy\",\n\ts.encrypted,\n\ts.locked,\n\t(select count(*) from posts p where p.\"sessionId\" = s.id and p.action is not null) as \"numberOfActions\",\t\n\t(select count(*) from posts p where p.\"sessionId\" = s.id) as \"numberOfPosts\",\n\t(\n\t\tselect count(*) from votes vv\n\t\tleft join posts vp on vp.id = vv.\"postId\"\n\t\twhere vp.\"sessionId\" = s.id\n\t) as \"numberOfVotes\",\n\t(\n\t\tselect json_agg(vis) from (\n\t\t\tselect vu.id, vu.name, vu.photo from visitors v\n\t\t\tjoin users vu on vu.id = v.\"usersId\"\n\t\t\twhere v.\"sessionsId\" = s.id\n\t\t) as vis\n\t) as participants\n\nfrom sessions s\nleft join users u on s.\"createdById\" = u.id\n\norder by s.updated desc"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","session_view"]);
        await queryRunner.query(`DROP VIEW "session_view"`);
        await queryRunner.query(`CREATE VIEW "public"."session_view" AS select 
	s.id,
	s.name,
	s.created,
	s."createdById",
	(
		select to_jsonb(cb) from (
			select cbu.id, cbu.name, cbu.photo from users cbu
			where cbu.id = s."createdById"
		) as cb
	) as "createdBy",
	s.encrypted,
	s.locked,
	(select count(*) from posts p where p."sessionId" = s.id and p.action is not null) as "numberOfActions",	
	(select count(*) from posts p where p."sessionId" = s.id) as "numberOfPosts",
	(
		select count(*) from votes vv
		left join posts vp on vp.id = vv."postId"
		where vp."sessionId" = s.id
	) as "numberOfVotes",
	(
		select json_agg(vis) from (
			select vu.id, vu.name, vu.photo from visitors v
			join users vu on vu.id = v."usersId"
			where v."sessionsId" = s.id
		) as vis
	) as participants

from sessions s
left join users u on s."createdById" = u.id

order by s.updated desc`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","session_view","select \n\ts.id,\n\ts.name,\n\ts.created,\n\ts.\"createdById\",\n\t(\n\t\tselect to_jsonb(cb) from (\n\t\t\tselect cbu.id, cbu.name, cbu.photo from users cbu\n\t\t\twhere cbu.id = s.\"createdById\"\n\t\t) as cb\n\t) as \"createdBy\",\n\ts.encrypted,\n\ts.locked,\n\t(select count(*) from posts p where p.\"sessionId\" = s.id and p.action is not null) as \"numberOfActions\",\t\n\t(select count(*) from posts p where p.\"sessionId\" = s.id) as \"numberOfPosts\",\n\t(\n\t\tselect count(*) from votes vv\n\t\tleft join posts vp on vp.id = vv.\"postId\"\n\t\twhere vp.\"sessionId\" = s.id\n\t) as \"numberOfVotes\",\n\t(\n\t\tselect json_agg(vis) from (\n\t\t\tselect vu.id, vu.name, vu.photo from visitors v\n\t\t\tjoin users vu on vu.id = v.\"usersId\"\n\t\t\twhere v.\"sessionsId\" = s.id\n\t\t) as vis\n\t) as participants\n\nfrom sessions s\nleft join users u on s.\"createdById\" = u.id\n\norder by s.updated desc"]);
    }

}
