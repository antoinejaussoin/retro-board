import { type Stripe, loadStripe } from '@stripe/stripe-js';
import config from '../utils/getConfig';

let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.STRIPE_KEY);
  }
  return stripePromise;
};
