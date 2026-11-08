/** Query strings treat "+" as a space. Addresses can contain "+" and never a raw space. */
export function emailFromQuery(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  return value.replaceAll(' ', '+');
}
