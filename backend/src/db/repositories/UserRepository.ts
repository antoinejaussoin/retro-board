import { EntityRepository } from 'typeorm';
import { UserEntity } from '../entities';
import { FullUser, User as JsonUser } from '../../common';
import { addDays } from 'date-fns';
import BaseRepository from './BaseRepository';

@EntityRepository(UserEntity)
export default class UserRepository extends BaseRepository<UserEntity> {
  async saveFromJson(user: JsonUser): Promise<UserEntity> {
    return await this.saveAndReload(user);
  }
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  }

  async startTrial(user: FullUser): Promise<UserEntity | null> {
    const userEntity = await this.findOne(user.id);
    if (userEntity && !userEntity.trial && !user.pro) {
      userEntity.trial = addDays(new Date(), 30);
      return await this.saveAndReload(userEntity);
    }
    return null;
  }
}
