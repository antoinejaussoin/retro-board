import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities';
import { FullUser, User as JsonUser } from '@retrospected/common';
import { addDays } from 'date-fns';

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> {
  async saveFromJson(user: JsonUser): Promise<UserEntity> {
    return await this.save(user);
  }
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  }

  async startTrial(user: FullUser): Promise<UserEntity | null> {
    const userEntity = await this.findOne(user.id);
    if (userEntity && !userEntity.trial && !user.pro) {
      userEntity.trial = addDays(new Date(), 30);
      return await this.save(userEntity);
    }
    return null;
  }
}
