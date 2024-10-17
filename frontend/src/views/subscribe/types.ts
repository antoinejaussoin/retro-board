import type { Currency, Plan } from 'common';

export interface Order {
  plan: Plan;
  currency: Currency;
}
