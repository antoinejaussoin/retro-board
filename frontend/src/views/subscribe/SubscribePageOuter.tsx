import { Elements, ElementProps } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { FunctionComponent } from 'react';
import { getStripe } from '../../stripe/get-stripe';
import SubscriberPage from './SubscribePage';

type ElementsPropsExt = ElementProps & {
  children: React.ReactNode;
  stripe: PromiseLike<Stripe | null> | Stripe | null;
};

// This is needed until Stripe updates their React typings to v18.
const ElementsExt = Elements as FunctionComponent<ElementsPropsExt>;

export default function SubscribePageOuter() {
  return (
    <ElementsExt stripe={getStripe()}>
      <SubscriberPage />
    </ElementsExt>
  );
}
