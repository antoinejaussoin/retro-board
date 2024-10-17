import express from 'express';
import type { Router } from 'express';
import type {
  CreateSubscriptionPayload,
  Product,
  StripeLocales,
} from '../common/index.js';
import config from '../config.js';
import Stripe from 'stripe';
import type { UserIdentityEntity } from '../db/entities/index.js';
import type {
  StripeEvent,
  CheckoutCompletedPayload,
  SubscriptionDeletedPayload,
} from './types.js';
import { plans, getProduct } from './products.js';
import { getUserByEmail, updateUser } from '../db/actions/users.js';
import { registerLicence } from '../db/actions/licences.js';
import { getIdentityFromRequest } from '../utils.js';
import isValidDomain from '../security/is-valid-domain.js';
import {
  cancelSubscription,
  activateSubscription,
  getActiveSubscriptionWhereUserIsOwner,
  saveSubscription,
  startTrial,
  getActiveSubscriptionWhereUserIsAdmin,
} from '../db/actions/subscriptions.js';
import { trackPurchase } from './../track/track.js';

const stripe = config.STRIPE_SECRET
  ? new Stripe(config.STRIPE_SECRET, {
      apiVersion: '2024-09-30.acacia',
    } as Stripe.StripeConfig)
  : null;

function stripeRouter(): Router {
  const router = express.Router();

  async function getCustomerId(
    identity: UserIdentityEntity,
    locale: StripeLocales,
  ): Promise<string> {
    if (!stripe) {
      throw Error('Stripe is not configured');
    }
    if (identity.accountType === 'anonymous') {
      throw Error('Anonymous account should not be able to pay');
    }

    if (!identity.user.stripeId && identity.username) {
      // Create a new customer object
      const userData = {
        email: identity.user.email || identity.username,
        name: identity.user.name,
        metadata: {
          userId: identity.user.id,
        },
        preferred_locales: [locale],
      };
      const customer = await stripe.customers.create(userData);

      await updateUser(identity.user.id, {
        stripeId: customer.id,
      });
      return customer.id;
    }
    if (identity.user.stripeId) {
      return identity.user.stripeId;
    }
    throw Error('Unspecified error');
  }

  router.post('/webhook', async (req, res) => {
    if (!stripe) {
      throw Error('Stripe is not configured');
    }
    const signature = (req.headers['stripe-signature'] as string).trim();
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.buf,
        signature,
        config.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log(err);
      console.log('⚠️  Webhook signature verification failed.');
      console.log(
        '⚠️  Check the env file and enter the correct webhook secret.',
      );
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    // const dataObject = event.data.object;
    // console.log('Data object', dataObject);

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case 'invoice.paid':
        // Used to provision services after the trial has ended.
        // The status of the invoice will show up as paid. Store the status in your
        // database to reference when a user accesses your service to avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case 'customer.subscription.deleted':
        {
          console.log('Deleted Sub', event);
          const cancelEvent =
            event as unknown as StripeEvent<SubscriptionDeletedPayload>;
          if (event.request != null) {
            console.log('Manual cancellation');
            // handle a subscription cancelled by your request
            // from above.
          } else {
            console.log('Automatic cancellation');
            // handle subscription cancelled automatically based
            // upon your subscription settings.
          }
          await cancelSubscription(cancelEvent.data.object.id);
        }

        break;
      case 'checkout.session.completed':
        {
          const subEvent =
            event as unknown as StripeEvent<CheckoutCompletedPayload>;

          console.log('> checkout session completed');

          const session = await stripe.checkout.sessions.retrieve(
            subEvent.data.object.id,
            {
              expand: ['line_items'],
            },
          );

          console.log('Checkout session completed: ', session);
          console.log('Line item: ', session.line_items?.data[0]);
          const product = session.line_items?.data[0].price;
          const customerEmail = session.customer_details?.email || null;
          const stripeCustomerId = session.customer as string;
          const stripeSessionId = session.id;
          const user = customerEmail
            ? await getUserByEmail(customerEmail)
            : null;

          const customer = (await stripe.customers.retrieve(
            stripeCustomerId,
          )) as Stripe.Response<Stripe.Customer>;
          const customerName = customer.name;

          if (subEvent.data.object.payment_status === 'paid') {
            if (session.line_items?.data[0]) {
              const lineItem = session.line_items.data[0];
              trackPurchase(
                stripeCustomerId,
                user ? user.id : stripeCustomerId,
                session.id,
                (lineItem.price?.product as string | null) || lineItem.id,
                lineItem.description,
                lineItem.quantity || 0,
                lineItem.currency,
                lineItem.amount_total / 100,
              );
            }

            if (
              product &&
              product.product === config.STRIPE_SELF_HOSTED_PRODUCT
            ) {
              console.log(' >> Received payment for a Self Hosted product');
              await registerLicence(
                customerEmail,
                customerName,
                stripeCustomerId,
                stripeSessionId,
              );
            } else {
              console.log(' >> Received payment for a regular subscription');
              await activateSubscription(
                subEvent.data.object.client_reference_id,
                subEvent.data.object.subscription,
                subEvent.data.object.metadata.plan,
                subEvent.data.object.metadata.domain,
                subEvent.data.object.metadata.currency,
              );
            }
          }
        }

        break;
      case 'charge.succeeded':
        console.log(' >> Charge succeeded');
        break;
      default:
        // Unexpected event type
        console.log(' >> Unknown event: ', event.type);
    }
    res.sendStatus(200);
  });

  router.post('/create-checkout-session', async (req, res) => {
    if (!stripe) {
      throw Error('Stripe is not configured');
    }
    const payload = req.body as CreateSubscriptionPayload;
    const { yearly, ...actualPayload } = payload;
    const identity = await getIdentityFromRequest(req);
    const product = getProduct(payload.plan);

    if (payload.domain && !isValidDomain(payload.domain)) {
      return res.status(403).send();
    }

    if (identity) {
      const customerId = await getCustomerId(identity, payload.locale);
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          client_reference_id: identity.user.id,
          customer: customerId,
          metadata: {
            ...actualPayload,
          },
          line_items: [
            {
              quantity: 1,
              price_data: {
                product: product.productId,
                currency: payload.currency,
                recurring: {
                  interval: yearly ? 'year' : 'month',
                  interval_count: 1,
                },
                unit_amount: product[payload.currency] * (yearly ? 11 : 1),
              },
            },
          ],
          mode: 'subscription',
          success_url: `${config.BASE_URL}/account?welcome`,
          cancel_url: `${config.BASE_URL}/subscribe`,
        });

        res.json({ id: session.id });
      } catch (err) {
        console.log(
          'Cannot create Stripe checkout session for customer ',
          customerId,
          err,
        );
      }
    }
  });

  router.get('/products', (_, res) => {
    const products: Product[] = plans.map(({ priceId, productId, ...p }) => p);
    res.status(200).send(products);
  });

  router.get('/portal', async (req, res) => {
    if (!stripe) {
      throw Error('Stripe is not configured');
    }
    const identity = await getIdentityFromRequest(req);
    if (identity?.user.stripeId) {
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: identity.user.stripeId,
          return_url: `${config.BASE_URL}/account`,
        });
        res.status(200).send({ url: session.url });
      } catch (_err) {
        console.error('Cannot find Stripe customer ', identity.user.stripeId);
        res.status(500).send();
      }
    } else {
      res.status(500).send();
    }
  });

  router.get('/members', async (req, res) => {
    // possibly move this
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const subscription = await getActiveSubscriptionWhereUserIsAdmin(
        identity.user.id,
        identity.user.email,
      );
      if (subscription && subscription.plan === 'team') {
        return res.status(200).send(subscription.members);
      }
    }
    res.status(401).send();
  });

  router.patch('/members', async (req, res) => {
    // possibly move this
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const subscription = await getActiveSubscriptionWhereUserIsAdmin(
        identity.user.id,
        identity.user.email,
      );
      if (subscription && subscription.plan === 'team') {
        subscription.members = req.body as string[];
        await saveSubscription(subscription);
        return res.status(200).send();
      }
    }
    res.status(401).send();
  });

  router.patch('/admins', async (req, res) => {
    // possibly move this
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const subscription = await getActiveSubscriptionWhereUserIsOwner(
        identity.user.id,
      );
      if (subscription && subscription.plan === 'team') {
        subscription.admins = req.body as string[];
        await saveSubscription(subscription);
        return res.status(200).send();
      }
    }
    res.status(401).send();
  });

  router.get('/domain/:domain', async (req, res) => {
    const domain = req.params.domain;
    return res.status(200).send(isValidDomain(domain));
  });

  router.post('/start-trial', async (req, res) => {
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const updatedUser = await startTrial(identity.user.id);
      if (updatedUser) {
        return res.status(200).send();
      }
    }

    return res.status(500).send();
  });

  return router;
}

export default stripeRouter;
