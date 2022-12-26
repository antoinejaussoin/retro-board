import { dataSource } from '../index';
import { EntityManager } from 'typeorm';

type Inner<T> = (manager: EntityManager) => Promise<T>;

export async function transaction<T>(cb: Inner<T>): Promise<T> {
  return await dataSource.transaction(async (manager) => {
    return cb(manager);
  });
}
