import { InternalProduct } from './types';
import { Plan } from '@retrospected/common';
import config from '../db/config';

export const teamPlan: InternalProduct = {
  name: 'Pro Team',
  plan: 'team',
  productId: config.STRIPE_TEAM_PRODUCT,
  priceId: config.STRIPE_TEAM_PRICE,
  seats: 20,
  eur: 990,
  gbp: 890,
  usd: 1190,
};

export const companyPlan: InternalProduct = {
  name: 'Pro Unlimited',
  plan: 'unlimited',
  productId: config.STRIPE_UNLIMITED_PRODUCT,
  priceId: config.STRIPE_UNLIMITED_PRICE,
  seats: null,
  eur: 4990,
  gbp: 3990,
  usd: 5990,
};

export const plans: InternalProduct[] = [teamPlan, companyPlan];

export function getProduct(plan: Plan): InternalProduct {
  return plans.find((p) => p.plan === plan)!;
}
