import { encrypt, decrypt } from '../crypto';
import { describe, expect, it } from 'vitest';

describe('Cryptography', () => {
  it('Can encrypt and decrypt successfuly with the correct key', () => {
    const key = 'foobar';
    const source = 'hello world';
    expect(decrypt(encrypt(source, key), key)).toEqual(source);
  });

  it('Will return the original string if no key and is not encrypted', () => {
    const key = null;
    const source = 'hello world';
    expect(encrypt(source, key)).toEqual(source);
    expect(decrypt(source, key)).toEqual(source);
  });

  it('Will return "(encrypted)" if no key and is encrypted', () => {
    const key = 'foobar';
    const source = 'hello world';
    const encrypted = encrypt(source, key);
    expect(decrypt(encrypted, null)).toEqual('(encrypted)');
  });

  it('Will return "(encrypted)" if the wrong key is used', () => {
    const key = 'foobar';
    const source = 'hello world';
    const encrypted = encrypt(source, key);
    expect(decrypt(encrypted, 'barfoo')).toEqual('(encrypted)');
  });

  it('Will append the encrypted string with a special prefix', () => {
    const key = 'foobar';
    const source = 'hello world';
    expect(encrypt(source, key).startsWith('<<ENCRYPTED>>')).toBeTruthy();
  });

  it('Will remove the special prefix if it was in clear text', () => {
    const key = 'foobar';
    const source = '<<ENCRYPTED>>hello world';
    expect(decrypt(encrypt(source, key), key)).toEqual('hello world');
  });

  it('Sanity check to ensure the crypto algo doesnt change and always produce the same result', () => {
    const key = 'foobar';
    const encrypted =
      '<<ENCRYPTED>>U2FsdGVkX19vBaSLDa0pMKwIum97gdBaKYRFV48N5caP2aba4l1zCWsLF0yu/dQe';
    const source = 'hello world';
    expect(decrypt(encrypted, key)).toEqual(source);
  });
});
