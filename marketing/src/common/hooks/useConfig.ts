type Config = {
  measurementId?: string;
  appUrl?: string;
};

export function useConfig(): Config {
  return {
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}
