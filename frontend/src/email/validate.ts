import { validate as validateBase } from 'isemail';

export function validate(email: string): boolean {
  return validateBase(email);
}
