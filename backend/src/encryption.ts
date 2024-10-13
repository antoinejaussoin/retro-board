import bcryptjs from 'bcryptjs';
import crypto from 'crypto-js';

const aes = crypto.AES;
const stringify = crypto.enc.Utf8.stringify;
const { compare, genSalt, hash } = bcryptjs;

export async function hashPassword(clearTextPassword: string): Promise<string> {
  const salt = await genSalt();
  const hashedPassword = await hash(clearTextPassword, salt);
  return hashedPassword;
}

export async function comparePassword(
  clearTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const match = await compare(clearTextPassword, hashedPassword);
  return match;
}

export function encrypt(clear: string, key: string): string {
  const encrypted = aes.encrypt(clear, key).toString();
  return encrypted;
}

export function decrypt(encrypted: string, key: string): string {
  const bytes = aes.decrypt(encrypted, key);
  const clear = stringify(bytes);
  return clear;
}
