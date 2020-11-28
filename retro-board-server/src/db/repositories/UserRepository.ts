import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities';
import { User as JsonUser } from '@retrospected/common';

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> {
  async saveFromJson(user: JsonUser): Promise<UserEntity> {
    return await this.save(user);
  }
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  }
}
