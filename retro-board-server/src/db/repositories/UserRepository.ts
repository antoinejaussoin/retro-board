import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities';
import { User as JsonUser } from 'retro-board-common';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  async saveFromJson(user: JsonUser): Promise<void> {
    await this.save<JsonUser>(user);
  }
}
