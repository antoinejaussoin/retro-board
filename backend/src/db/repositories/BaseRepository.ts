import {
  type DeepPartial,
  type EntityTarget,
  Repository,
  type SaveOptions,
} from 'typeorm';
import type { Entity } from '../../common/index.js';
import { dataSource } from '../index.js';

export async function saveAndReload<T extends Entity>(
  repo: Repository<T>,
  entity: DeepPartial<T>,
  options?: SaveOptions,
): Promise<T> {
  const saved = await repo.save(entity, options);
  // biome-ignore lint/suspicious/noExplicitAny: Temporary
  const reloaded = await repo.findOne({ where: { id: saved.id as any } });
  return reloaded as T;
}

export function getBaseRepository<T extends Entity>(entity: EntityTarget<T>) {
  return dataSource.getRepository(entity);
}

export default class BaseRepository<T extends Entity> extends Repository<T> {}
