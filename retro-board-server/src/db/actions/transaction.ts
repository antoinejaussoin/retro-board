import { EntityManager, getConnection } from 'typeorm';

type Inner<T> = (manager: EntityManager) => Promise<T>;

export async function transaction<T>(cb: Inner<T>): Promise<T> {
  return await getConnection().transaction(async (manager) => {
    return cb(manager);
  });
}
