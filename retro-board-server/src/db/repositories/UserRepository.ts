import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities';
import { User as JsonUser } from '@retrospected/common';
import { addDays } from 'date-fns';

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> {
  async saveFromJson(user: JsonUser): Promise<UserEntity> {
    return await this.save(user);
  }
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  }

  async startTrial(userId: string): Promise<UserEntity | null> {
    const user = await this.findOne(userId);
    if (user && !user.trial) {
      user.trial = addDays(new Date(), 30);
      return await this.save(user);
    }
    return null;
  }
}
