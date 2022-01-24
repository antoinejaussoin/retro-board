import { ViewEntity, ViewColumn } from 'typeorm';
import { User, SessionMetadata } from '../../common';

@ViewEntity({
  expression: `
select 
	s.id,
	s.name,
	s.created,
	(
		select to_jsonb(cb) from (
			select cbu.id, cbu.name, cbu.photo from users cbu
			where cbu.id = s.created_by_id
		) as cb
	) as created_by,
	s.encrypted,
	s.locked,
	(select count(*) from posts p where p.session_id = s.id and p.action is not null) as "number_of_actions",	
	(select count(*) from posts p where p.session_id = s.id) as "number_of_posts",
	(
		select count(*) from votes vv
		left join posts vp on vp.id = vv.post_id
		where vp.session_id = s.id
	) as "number_of_votes",
	(
		select json_agg(vis) from (
			select vu.id, vu.name, vu.photo from visitors v
			join users vu on vu.id = v.users_id
			where v.sessions_id = s.id
		) as vis
	) as participants

from sessions s
left join users u on s.created_by_id = u.id

order by s.updated desc
  `,
})
export default class SessionView {
  @ViewColumn()
  public id: string;
  @ViewColumn()
  public name: string;
  @ViewColumn()
  public created: Date;
  @ViewColumn()
  public createdBy: User;
  @ViewColumn()
  public encrypted: string | null;
  @ViewColumn()
  public locked: boolean;
  @ViewColumn()
  public numberOfActions: number;
  @ViewColumn()
  public numberOfPosts: number;
  @ViewColumn()
  public numberOfVotes: number;
  @ViewColumn()
  public participants: User[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.created = new Date();
    this.createdBy = { id: '0', name: '', photo: '' };
    this.encrypted = null;
    this.locked = false;
    this.numberOfActions = 0;
    this.numberOfPosts = 0;
    this.numberOfVotes = 0;
    this.participants = [];
  }

  toJson(userId: string): SessionMetadata {
    return {
      ...this,
      canBeDeleted: userId === this.createdBy.id,
      lockedForUser:
        this.locked && this.participants
          ? !this.participants.map((v) => v.id).includes(userId)
          : false,
    };
  }
}
