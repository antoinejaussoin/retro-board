import { cbc, gcm } from '@noble/ciphers/aes.js';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';
import { md5 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { getItem, setItem } from '../utils/localStorage';

export const ENCRYPTED_PREFIX = '<<ENCRYPTED>>';
export const GCM_PREFIX = '<<GCM>>';
export const CHECK_PREFIX = 'check';
export const CANT_DECRYPT = '(encrypted)';

const NONCE_LENGTH = 12;
const SALTED_PREFIX = utf8ToBytes('Salted__');

function passphraseKey(passphrase: string): Uint8Array {
  return sha256(utf8ToBytes(passphrase));
}

function randomNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function pack(nonce: Uint8Array, sealed: Uint8Array): string {
  const packed = new Uint8Array(nonce.length + sealed.length);
  packed.set(nonce, 0);
  packed.set(sealed, nonce.length);
  return GCM_PREFIX + bytesToBase64(packed);
}

function unpack(
  payload: string,
): { nonce: Uint8Array; sealed: Uint8Array } | null {
  if (!payload.startsWith(GCM_PREFIX)) {
    return null;
  }
  const packed = base64ToBytes(payload.slice(GCM_PREFIX.length));
  if (!packed || packed.length < NONCE_LENGTH + 16) {
    return null;
  }
  return {
    nonce: packed.subarray(0, NONCE_LENGTH),
    sealed: packed.subarray(NONCE_LENGTH),
  };
}

function copyBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export function sealNoble(plain: Uint8Array, passphrase: string): string {
  const nonce = randomNonce();
  const sealed = gcm(passphraseKey(passphrase), nonce).encrypt(plain);
  return pack(nonce, sealed);
}

export function openNoble(
  payload: string,
  passphrase: string,
): Uint8Array | null {
  const parts = unpack(payload);
  if (!parts) {
    return null;
  }
  try {
    return gcm(passphraseKey(passphrase), parts.nonce).decrypt(parts.sealed);
  } catch {
    return null;
  }
}

export async function sealSubtle(
  plain: Uint8Array,
  passphrase: string,
): Promise<string> {
  const nonce = randomNonce();
  const key = await crypto.subtle.importKey(
    'raw',
    copyBuffer(passphraseKey(passphrase)),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: copyBuffer(nonce) },
      key,
      copyBuffer(plain),
    ),
  );
  return pack(nonce, sealed);
}

export async function openSubtle(
  payload: string,
  passphrase: string,
): Promise<Uint8Array | null> {
  const parts = unpack(payload);
  if (!parts) {
    return null;
  }
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      copyBuffer(passphraseKey(passphrase)),
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );
    return new Uint8Array(
      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: copyBuffer(parts.nonce) },
        key,
        copyBuffer(parts.sealed),
      ),
    );
  } catch {
    return null;
  }
}

function startsWithBytes(bytes: Uint8Array, prefix: Uint8Array): boolean {
  if (bytes.length < prefix.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}

function evpBytesToKey(
  password: Uint8Array,
  salt: Uint8Array,
): { key: Uint8Array; iv: Uint8Array } {
  const blocks: Uint8Array[] = [];
  let previous = new Uint8Array(0);
  let length = 0;
  while (length < 48) {
    const input = new Uint8Array(previous.length + password.length + salt.length);
    input.set(previous, 0);
    input.set(password, previous.length);
    input.set(salt, previous.length + password.length);
    previous = md5(input);
    blocks.push(previous);
    length += previous.length;
  }
  const derived = new Uint8Array(length);
  let offset = 0;
  for (const block of blocks) {
    derived.set(block, offset);
    offset += block.length;
  }
  return { key: derived.subarray(0, 32), iv: derived.subarray(32, 48) };
}

function openLegacy(payload: string, passphrase: string): Uint8Array | null {
  const raw = base64ToBytes(payload.slice(ENCRYPTED_PREFIX.length));
  if (!raw || !startsWithBytes(raw, SALTED_PREFIX) || raw.length <= 16) {
    return null;
  }
  try {
    const { key, iv } = evpBytesToKey(
      utf8ToBytes(passphrase),
      raw.subarray(8, 16),
    );
    return cbc(key, iv).decrypt(raw.subarray(16));
  } catch {
    return null;
  }
}

function readPlain(bytes: Uint8Array | null): string | null {
  if (!bytes) {
    return null;
  }
  const text = bytesToUtf8(bytes);
  if (!text.startsWith(CHECK_PREFIX)) {
    return null;
  }
  return text.slice(CHECK_PREFIX.length);
}

export function encrypt(clear: string | null, key: string | null): string {
  if (!clear) {
    return '';
  }
  if (!key) {
    return clear;
  }
  const plain = utf8ToBytes(
    CHECK_PREFIX + clear.replace(ENCRYPTED_PREFIX, '').replace(GCM_PREFIX, ''),
  );
  // Posts are decrypted while rendering, so the page seals with the
  // synchronous implementation. sealSubtle writes this same layout when
  // crypto.subtle is available, and the tests open each side with the other.
  return sealNoble(plain, key);
}

export function decrypt(encrypted: string | null, key: string | null): string {
  if (!encrypted) {
    return '';
  }
  const gcmPayload = encrypted.startsWith(GCM_PREFIX);
  const legacyPayload = encrypted.startsWith(ENCRYPTED_PREFIX);
  if (!gcmPayload && !legacyPayload) {
    return encrypted;
  }
  if (!key) {
    return CANT_DECRYPT;
  }
  const clear = gcmPayload
    ? readPlain(openNoble(encrypted, key))
    : readPlain(openLegacy(encrypted, key));
  return clear ?? CANT_DECRYPT;
}

function getLocalStorageKey(sessionId: string | null): string | null {
  return sessionId ? `session-encryption-key-${sessionId}` : null;
}

export function storeEncryptionKeyLocally(
  sessionId: string | null,
  key: string,
) {
  const localStorageKey = getLocalStorageKey(sessionId);
  if (localStorageKey) {
    setItem(localStorageKey, key);
  }
}

export function getStoredEncryptionKey(
  sessionId: string | null,
): string | null {
  const localStorageKey = getLocalStorageKey(sessionId);
  if (localStorageKey) {
    return getItem(localStorageKey);
  }
  return null;
}
