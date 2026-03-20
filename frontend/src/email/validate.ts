const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(email: string): boolean {
  return emailRegex.test(email);
}
