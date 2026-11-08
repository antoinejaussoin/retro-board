import isEmail from 'validator/es/lib/isEmail';

export function validate(email: string): boolean {
  return isEmail(email);
}
