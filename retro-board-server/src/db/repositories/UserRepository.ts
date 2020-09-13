import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities';
import { User as JsonUser } from 'retro-board-common';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  async saveFromJson(user: JsonUser): Promise<JsonUser> {
    return await this.save<JsonUser>(user);
  }
  async persistTemplate(userId: string, templateId: string): Promise<void> {
    await this.update({ id: userId }, { defaultTemplate: { id: templateId } });
  }
}
