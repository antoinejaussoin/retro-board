import { isFree, isDisposable } from 'freemail';

export default function isValidDomain(domain: string) {
  const email = `foo@${domain}`;
  return !isFree(email) && !isDisposable(email);
}
