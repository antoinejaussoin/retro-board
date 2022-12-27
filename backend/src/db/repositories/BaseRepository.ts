import { DeepPartial, EntityTarget, Repository, SaveOptions } from 'typeorm';
import { Entity } from '../../common';
import { dataSource } from '../index';

export async function saveAndReload<T extends Entity>(
  repo: Repository<T>,
  entity: DeepPartial<T>,
  options?: SaveOptions
): Promise<T> {
  const saved = await repo.save(entity, options);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reloaded = await repo.findOne({ where: { id: saved.id as any } });
  return reloaded!;
}

export function getBaseRepository<T extends Entity>(entity: EntityTarget<T>) {
  return dataSource.getRepository(entity);
}

export default class BaseRepository<T extends Entity> extends Repository<T> {}
