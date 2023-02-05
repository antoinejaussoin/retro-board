export function isProduction(): boolean {
  console.log('NODE_ENV: ', process.env.NODE_ENV);
  console.log('MODE: ', import.meta.env.MODE);
  console.log('PROD: ', import.meta.env.PROD);
  return import.meta.env.PROD;
}
