import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../stripe/get-stripe';
import SubscriberPage from './SubscribePage';

export default function SubscribePageOuter() {
  return (
    <Elements stripe={getStripe()}>
      <SubscriberPage />
    </Elements>
  );
}
