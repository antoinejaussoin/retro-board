import {
  CreateSubscriptionPayload,
  Plan,
  Currency,
  StripeLocales,
} from '@retrospected/common';
import { fetchGet, fetchPostGet } from '../../api/fetch';

interface SessionIdResponse {
  id: string;
}

export async function createCheckoutSession(
  plan: Plan,
  currency: Currency,
  locale: StripeLocales,
  domain: string | null
): Promise<SessionIdResponse | null> {
  const payload: CreateSubscriptionPayload = {
    plan,
    currency,
    domain,
    locale,
  };
  return await fetchPostGet<
    CreateSubscriptionPayload,
    SessionIdResponse | null
  >('/api/stripe/create-checkout-session', null, payload);
}

export async function isValidDomain(domain: string): Promise<boolean> {
  const result = await fetchGet(
    `/api/stripe/domain/${encodeURIComponent(domain)}`,
    false
  );
  return result;
}
