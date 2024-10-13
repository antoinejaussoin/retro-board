import type { Plan, Currency } from 'common';

export interface Order {
  plan: Plan;
  currency: Currency;
}
