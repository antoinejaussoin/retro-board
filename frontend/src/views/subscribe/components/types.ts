import type { Currency } from 'common';

export interface CurrencyMetadata {
  value: Currency;
  iso: string;
  name: string;
}

export const currencies: CurrencyMetadata[] = [
  { iso: 'us', name: 'US Dollar', value: 'usd' },
  { iso: 'eu', name: 'Euro', value: 'eur' },
  { iso: 'gb', name: 'British Pound', value: 'gbp' },
];
