export function hasField<T>(field: string, obj: T): boolean {
  if (typeof obj !== 'object' || obj === null || obj === undefined) {
    return false;
  }
  const properties = Object.getOwnPropertyNames(obj);

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (obj as any)[properties[i]];
    if (property === field) {
      return true;
    }
    if (hasField(field, value)) {
      return true;
    }
  }
  return false;
}
