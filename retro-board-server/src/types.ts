export interface Store {
  get: (key: string) => Promise<any>;
  set: (obj: any) => Promise<unknown>;
}

export interface Configuration {
  DB_TYPE: 'postgres' | 'nedb';
  SERVER_SALT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  JWT_SECRET: string;
  SESSION_SECRET: string;
  PORT: number;
}
