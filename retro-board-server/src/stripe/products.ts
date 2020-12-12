import { InternalProduct } from './types';
import { Plan } from '@retrospected/common';
import config from '../db/config';

export const teamPlan: InternalProduct = {
  name: 'Pro Team',
  plan: 'team',
  productId: config.STRIPE_TEAM_PRODUCT,
  priceId: config.STRIPE_TEAM_PRICE,
  seats: 20,
  eur: 995,
  gbp: 895,
  usd: 995,
};

export const companyPlan: InternalProduct = {
  name: 'Pro Unlimited',
  plan: 'unlimited',
  productId: config.STRIPE_UNLIMITED_PRODUCT,
  priceId: config.STRIPE_UNLIMITED_PRICE,
  seats: null,
  eur: 4995,
  gbp: 3995,
  usd: 4995,
};

export const plans: InternalProduct[] = [teamPlan, companyPlan];

export function getProduct(plan: Plan): InternalProduct {
  return plans.find((p) => p.plan === plan)!;
}
