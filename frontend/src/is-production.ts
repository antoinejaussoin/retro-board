export function isProduction(): boolean {
  return import.meta.env.PROD;
}
