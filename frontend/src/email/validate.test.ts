import { describe, expect, it } from 'vitest';
import { validate } from './validate';

describe('validate', () => {
  it('accepts a normal address', () => {
    expect(validate('vlad.zelensky.1@ukraine.ua')).toBe(true);
  });

  it('rejects an address without a domain', () => {
    expect(validate('not-an-email')).toBe(false);
  });
});
