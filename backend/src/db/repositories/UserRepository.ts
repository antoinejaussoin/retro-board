import { UserEntity } from '../entities/index.js';
import type { FullUser, User as JsonUser } from '../../common/index.js';
import { addDays } from 'date-fns';
import { getBaseRepository, saveAndReload } from './BaseRepository.js';

export default getBaseRepository(UserEntity).extend({
  async saveFromJson(user: JsonUser): Promise<UserEntity> {
    return await saveAndReload(this, user as UserEntity);
  },
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  },

  async startTrial(user: FullUser): Promise<UserEntity | null> {
    const userEntity = await this.findOne({ where: { id: user.id } });
    if (userEntity && !userEntity.trial && !user.pro) {
      userEntity.trial = addDays(new Date(), 30);
      return await saveAndReload(this, userEntity);
    }
    return null;
  },
  async getRelatedUsersIds(userId: string): Promise<string[]> {
    const ids: Array<{ id: string }> = await this.query(
      `
    select distinct u2.id from users u
	left join visitors v on v.users_id = u.id
	left join sessions s on v.sessions_id = s.id
	left join visitors v2 on v2.sessions_id = s.id
	left join users u2 on v2.users_id = u2.id
	where 
		u.id = $1 and
		u2.email is not null
    `,
      [userId],
    );
    return ids.map((i) => i.id);
  },
});
