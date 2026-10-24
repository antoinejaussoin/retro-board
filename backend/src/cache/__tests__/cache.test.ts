import { createCache, inMemoryCache } from '../cache';

const { set, get, invalidate } = inMemoryCache();

describe('Cache - Set', () => {
  it('Should return true no matter what', async () => {
    const result = await set('foo', 'bar', 1000000);
    expect(result).toBe(true);
  });
});

describe('Cache - Get', () => {
  it('Should return null if the cache wasnt set', async () => {
    const result = await get('something');
    expect(result).toBe(null);
  });

  it('Should return the object if in the cache', async () => {
    const obj = { foo: 'bar' };
    await set('something_else', obj, 10000);
    const result = await get('something_else');
    expect(result).toBe(obj);
  });

  it('Should not return the object if passed the time', async () => {
    const obj = { foo: 'bar' };
    await set('something_else_again', obj, 1);
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await get('something_else_again');
        expect(result).toBe(null);
        resolve(true);
      }, 10);
    });
  });
});

describe('Cache - Invalidate', () => {
  it('Should not return the value if invalidated', async () => {
    const obj = { foo: 'bar' };
    await set('invalidated', obj, 10000);
    await invalidate('invalidated');
    const result = await get('invalidated');
    expect(result).toBe(null);
  });
});

describe('Cache - Async storage', () => {
  it('Should wait for storage before reporting success', async () => {
    let finishWrite!: () => void;
    const write = new Promise<void>((resolve) => {
      finishWrite = resolve;
    });
    const cache = createCache(
      async () => null,
      () => write,
    );
    let settled = false;
    const saved = cache.set('delayed', 'value', 10000);
    void saved.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    finishWrite();
    await expect(saved).resolves.toBe(true);
  });

  it('Should propagate a storage failure', async () => {
    const error = new Error('Synthetic write failed');
    const write = Promise.reject(error);
    void write.catch(() => {});
    const cache = createCache(
      async () => null,
      () => write,
    );
    await expect(cache.set('failed', 'value', 10000)).rejects.toBe(error);
  });
});
