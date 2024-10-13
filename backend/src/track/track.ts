import config from './../config.js';
import request from 'request';
import chalkTemplate from 'chalk-template';

export function trackPurchase(
  /**
   * Uniquely identifies a user instance of a web client
   */
  clientId: string,
  /**
   * A unique identifier for a user, cross device and platform
   */
  userId: string,
  transactionId: string,
  productId: string,
  productName: string | undefined,
  quantity: number,
  currency: string,
  value: number,
) {
  const measurementId = config.GA4_MEASUREMENT_ID;
  const secret = config.GA4_SECRET;

  if (!measurementId || !secret) {
    console.log(chalkTemplate`{red GA4 not configured}`);
    return;
  }

  type EventPayload = {
    /**
     * Uniquely identifies a user instance of a web client
     */
    client_id: string;
    /**
     * A unique identifier for a user, cross device and platform
     */
    user_id?: string;
    events: PurchaseEvent[];
  };

  type PurchaseEvent = {
    name: string;
    params: PurchaseEventParams;
  };

  type PurchaseEventParams = {
    currency?: string;
    value?: number;
    transaction_id: string;
    items: Item[];
  };

  type Item = {
    item_id: string;
    item_name: string;
    quantity: number;
  };

  const payload: EventPayload = {
    client_id: clientId,
    user_id: userId,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: transactionId,
          currency: currency,
          value: value,
          items: [
            {
              item_id: productId,
              item_name: productName || 'unknown product',
              quantity: quantity,
            },
          ],
        },
      },
    ],
  };

  console.log('Sending to GA: ', JSON.stringify(payload, null, 2));

  request.post(
    {
      url: `https://www.google-analytics.com/mp/collect?api_secret=${secret}&measurement_id=${measurementId}`,
      body: JSON.stringify(payload),
    },
    (err, res) => {
      console.log('Res: ', res.body);
      if (err) {
        console.error(err);
      } else {
        console.log('GA4 event sent successfully');
      }
    },
  );
}
