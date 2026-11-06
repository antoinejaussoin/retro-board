import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';
import { describe, expect, it } from 'vitest';
import {
  CHECK_PREFIX,
  decrypt,
  encrypt,
  openNoble,
  openSubtle,
  sealNoble,
  sealSubtle,
} from '../crypto';

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
    expect(encrypt(source, key).startsWith('<<GCM>>')).toBeTruthy();
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

  it('opens a noble ciphertext with subtle and a subtle ciphertext with noble', async () => {
    const key = 'foobar';
    const plain = utf8ToBytes(`${CHECK_PREFIX}hello world`);
    const fromNoble = sealNoble(plain, key);
    const fromSubtle = await sealSubtle(plain, key);

    expect(bytesToUtf8((await openSubtle(fromNoble, key))!)).toEqual(
      `${CHECK_PREFIX}hello world`,
    );
    expect(bytesToUtf8(openNoble(fromSubtle, key)!)).toEqual(
      `${CHECK_PREFIX}hello world`,
    );
    expect(decrypt(fromSubtle, key)).toEqual('hello world');
    expect(fromNoble).not.toEqual(fromSubtle);
  });
});
