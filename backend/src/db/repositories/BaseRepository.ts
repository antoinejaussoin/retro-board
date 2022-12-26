import { DeepPartial, EntityTarget, Repository, SaveOptions } from 'typeorm';
import { Entity } from '../../common';
import { dataSource } from '../index';

export function getBaseRepository<T extends Entity>(entity: EntityTarget<T>) {
  const repo = dataSource.getRepository(entity);
  const x = repo.extend({
    async saveAndReload(
      entity: DeepPartial<T>,
      options?: SaveOptions
    ): Promise<T> {
      const saved = await this.save(entity, options);
      const reloaded = await this.findOne({ where: { id: saved.id as any } }); // TODO
      return reloaded!;
    },
  });
  return x;
}

export default class BaseRepository<T extends Entity> extends Repository<T> {}
