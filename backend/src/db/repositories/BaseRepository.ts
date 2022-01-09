import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { Entity } from '../../common';

export default class BaseRepository<T extends Entity> extends Repository<T> {
  async saveAndReload(
    entity: DeepPartial<T>,
    options?: SaveOptions
  ): Promise<T> {
    const saved = await this.save(entity, options);
    const reloaded = await this.findOne(saved.id);
    return reloaded!;
  }
}
