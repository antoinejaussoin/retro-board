import type { Product, CreateSubscriptionPayload } from '../common/index.js';

export interface InternalProduct extends Product {
  productId: string;
  priceId: string;
}

export interface StripeEvent<T> {
  id: string;
  object: string;
  api_version: string | null;
  created: number;
  data: {
    object: T;
    livemode: boolean;
    pending_webhooks: number;
    request: string;
    type: string;
  };
}

export interface CheckoutCompletedPayload {
  id: string;
  object: string;
  allow_promotion_codes: unknown | null;
  amount_subtotal: number;
  amount_total: number;
  cancel_url: string;
  client_reference_id: string;
  currency: string;
  customer: string;
  customer_email: string | null;
  livemode: boolean;
  locale: string | null;
  payment_status: 'paid';
  /**
   * Subscription ID
   */
  subscription: string;
  success_url: string;
  metadata: CreateSubscriptionPayload;
}

export interface SubscriptionDeletedPayload {
  /**
   * Subscription ID
   */
  id: string;
  object: 'subscription';
  canceled_at: number;
  current_period_start: number;
  current_period_end: number;
  /**
   * Stripe customer ID (cus_)
   */
  customer: string;
  status: 'canceled';
}
