import { addMilliseconds } from 'date-fns';
import redis from 'redis';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, duration: number): Promise<boolean>;
  invalidate(key: string): Promise<void>;
}

export function createCache(
  getFn: (key: string) => Promise<unknown>,
  setFn: (key: string, value: unknown) => Promise<void>
): Cache {
  async function set<T>(
    key: string,
    value: T,
    duration: number
  ): Promise<boolean> {
    const entry: CacheEntry<T> = {
      data: value,
      expires: addMilliseconds(new Date(), duration).valueOf(),
    };
    setFn(key, entry);
    return true;
  }

  async function get<T>(key: string): Promise<T | null> {
    const item = (await getFn(key)) as CacheEntry<T>;
    if (item && new Date(item.expires) > new Date()) {
      return item.data;
    }
    return null;
  }

  async function invalidate(key: string): Promise<void> {
    return setFn(key, null);
  }
  return { get, set, invalidate };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _inMemoryCache: any = {};

export function inMemoryCache() {
  return createCache(
    (key) => _inMemoryCache[key],
    (key, value) => {
      _inMemoryCache[key] = value;
      return Promise.resolve();
    }
  );
}

export function redisCache(client: redis.RedisClient) {
  return createCache(
    (key) =>
      new Promise((resolve) => {
        client.get(key, (_, val) => {
          if (val) {
            resolve(JSON.parse(val));
          } else {
            resolve(null);
          }
        });
      }),
    (key, value) =>
      new Promise((resolve) => {
        client.set(key, JSON.stringify(value), () => {
          resolve();
        });
      })
  );
}
