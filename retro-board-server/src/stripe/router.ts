import express, { Router } from 'express';
import {
  CreateSubscriptionPayload,
  Product,
  StripeLocales,
} from '@retrospected/common';
import config from '../db/config';
import Stripe from 'stripe';
import { UserEntity } from '../db/entities';
import {
  StripeEvent,
  CheckoutCompletedPayload,
  SubscriptionDeletedPayload,
} from './types';
import { plans, getProduct } from './products';
import { updateUser } from '../db/actions/users';
import { getUserFromRequest } from '../utils';
import isValidDomain from '../security/is-valid-domain';
import {
  cancelSubscription,
  activateSubscription,
  getActiveSubscription,
  saveSubscription,
} from '../db/actions/subscriptions';
import { Connection } from 'typeorm';

const stripe = new Stripe(config.STRIPE_SECRET, {
  apiVersion: '2020-08-27',
} as Stripe.StripeConfig);

function stripeRouter(connection: Connection): Router {
  const router = express.Router();

  async function getCustomerId(
    user: UserEntity,
    locale: StripeLocales
  ): Promise<string> {
    if (user.accountType === 'anonymous') {
      throw Error('Anonymous account should not be able to pay');
    }

    if (!user.stripeId && user.username) {
      // Create a new customer object
      const userData = {
        email: user.email || user.username,
        name: user.name,
        metadata: {
          userId: user.id,
        },
        preferred_locales: [locale],
      };
      const customer = await stripe.customers.create(userData);

      await updateUser(connection, user.id, {
        stripeId: customer.id,
      });
      return customer.id;
    } else if (user.stripeId) {
      return user.stripeId;
    } else {
      throw Error('Unspecified error');
    }
  }

  router.post('/webhook', async (req, res) => {
    const signature = (req.headers['stripe-signature'] as string).trim();
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.buf,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      console.log('⚠️  Webhook signature verification failed.');
      console.log(
        '⚠️  Check the env file and enter the correct webhook secret.'
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
        console.log('Deleted Sub', event);
        const cancelEvent = (event as unknown) as StripeEvent<SubscriptionDeletedPayload>;
        if (event.request != null) {
          console.log('Manual cancellation');
          // handle a subscription cancelled by your request
          // from above.
        } else {
          console.log('Automatic cancellation');
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        await cancelSubscription(connection, cancelEvent.data.object.id);
        break;
      case 'checkout.session.completed':
        const subEvent = (event as unknown) as StripeEvent<CheckoutCompletedPayload>;

        if (subEvent.data.object.payment_status === 'paid') {
          await activateSubscription(
            connection,
            subEvent.data.object.client_reference_id,
            subEvent.data.object.subscription,
            subEvent.data.object.metadata.plan,
            subEvent.data.object.metadata.domain,
            subEvent.data.object.metadata.currency
          );
        }
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  });

  router.post('/create-checkout-session', async (req, res) => {
    const payload = req.body as CreateSubscriptionPayload;
    const user = await getUserFromRequest(connection, req);
    const product = getProduct(payload.plan);

    if (payload.domain && !isValidDomain(payload.domain)) {
      return res.status(403).send();
    }

    if (user) {
      const customerId = await getCustomerId(user, payload.locale);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        client_reference_id: user.id,
        customer: customerId,
        metadata: {
          ...payload,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              product: product.productId,
              currency: payload.currency,
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
              unit_amount: product[payload.currency],
            },
          },
        ],
        mode: 'subscription',
        success_url: `${config.BASE_URL}/account?welcome`,
        cancel_url: `${config.BASE_URL}/subscribe`,
      });

      res.json({ id: session.id });
    }
  });

  router.get('/products', (_, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const products: Product[] = plans.map(({ priceId, productId, ...p }) => p);
    res.status(200).send(products);
  });

  router.get('/portal', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    if (user && user.stripeId) {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeId,
        return_url: `${config.BASE_URL}/account`,
      });
      res.status(200).send(session);
    } else {
      res.status(500).send();
    }
  });

  router.get('/members', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    if (user) {
      const subscription = await getActiveSubscription(connection, user.id);
      if (subscription && subscription.plan === 'team') {
        return res.status(200).send(subscription.members);
      }
    }
    res.status(401).send();
  });

  router.patch('/members', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    if (user) {
      const subscription = await getActiveSubscription(connection, user.id);
      if (subscription && subscription.plan === 'team') {
        subscription.members = req.body as string[];
        await saveSubscription(connection, subscription);
        return res.status(200).send();
      }
    }
    res.status(401).send();
  });

  router.get('/domain/:domain', async (req, res) => {
    const domain = req.params.domain;
    return res.status(200).send(isValidDomain(domain));
  });

  return router;
}

export default stripeRouter;
