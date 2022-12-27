import { UserEntity } from '../entities';
import { FullUser, User as JsonUser } from '../../common';
import { addDays } from 'date-fns';
import { getBaseRepository, saveAndReload } from './BaseRepository';

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
});
