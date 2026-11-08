import { describe, expect, it } from 'vitest';
import { emailFromQuery } from './query';

describe('emailFromQuery', () => {
  it('restores a plus that the query parser turned into a space', () => {
    expect(emailFromQuery('ant mailjet@jaussoin.com')).toBe(
      'ant+mailjet@jaussoin.com',
    );
  });

  it('keeps an address that was percent-encoded', () => {
    const params = new URLSearchParams(
      'email=ant%2Bmailjet%40jaussoin.com&code=abc',
    );
    expect(emailFromQuery(params.get('email'))).toBe(
      'ant+mailjet@jaussoin.com',
    );
  });

  it('returns null when the parameter is absent', () => {
    expect(emailFromQuery(null)).toBeNull();
  });
});
