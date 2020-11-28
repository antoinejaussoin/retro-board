import {
  CreateSubscriptionPayload,
  Plan,
  Currency,
  StripeLocales,
} from '@retrospected/common';

const requestConfig: Partial<RequestInit> = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  redirect: 'follow',
  referrer: 'no-referrer',
};

export async function createCheckoutSession(
  plan: Plan,
  currency: Currency,
  locale: StripeLocales,
  domain: string | null
): Promise<{ id: string } | null> {
  const payload: CreateSubscriptionPayload = {
    plan,
    currency,
    domain,
    locale,
  };
  const response = await fetch(`/api/stripe/create-checkout-session`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const session: { id: string } = await response.json();
    return session;
  }
  return null;
}
