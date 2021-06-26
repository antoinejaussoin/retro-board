import { useMemo, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import queryString from 'query-string';
import { createCheckoutSession, isValidDomain } from './api';
import { useCallback } from 'react';
import styled from 'styled-components';
import Step from './components/Step';
import Button from '@material-ui/core/Button';
import deepPurple from '@material-ui/core/colors/deepPurple';
import grey from '@material-ui/core/colors/grey';
import { Currency, FullUser, Plan } from '@retrospected/common';
import CurrencyPicker from './components/CurrencyPicker';
import ProductPicker from './components/ProductPicker';
import Input from '../../components/Input';
import useUser from '../../auth/useUser';
import { Alert } from '@material-ui/lab';
import { useEffect } from 'react';
import useTranslations, { useLanguage } from '../../translations';
import useProducts from './components/useProducts';
import { find } from 'lodash';

function guessDomain(user: FullUser): string {
  if (user.email) {
    const parts = user.email.split('@');
    if (parts.length === 2) {
      return parts[1];
    }
  }
  return DEFAULT_DOMAIN;
}

const DEFAULT_DOMAIN = 'acme.com';

function SubscriberPage() {
  const user = useUser();
  const products = useProducts();
  const query = queryString.parse(window.location.search);
  const defaultProduct: Plan | null = query.product
    ? (query.product as Plan)
    : null;
  const [currency, setCurrency] = useState<Currency>('eur');
  const [plan, setPlan] = useState<Plan | null>(defaultProduct);
  const product = useMemo(() => {
    if (!plan || !products) {
      return null;
    }
    return find(products, (p) => p.plan === plan) || null;
  }, [plan, products]);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
  const stripe = useStripe();
  const { SubscribePage: translations } = useTranslations();
  const language = useLanguage();
  const needDomain = product && product.plan === 'unlimited';
  const needLogin =
    !!product &&
    product.plan !== 'self-hosted' &&
    (!user || user.accountType === 'anonymous');
  const [validDomain, setValidDomain] = useState(false);

  useEffect(() => {
    setValidDomain(false);
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})$/g;
    if (!domainRegex.test(domain)) {
      return;
    }
    async function checkFreeDomain() {
      const isValid = await isValidDomain(domain);
      setValidDomain(isValid);
    }
    checkFreeDomain();
  }, [domain]);

  useEffect(() => {
    if (user && domain === DEFAULT_DOMAIN) {
      if (user.currency) {
        setCurrency(user.currency);
      }
      setDomain(guessDomain(user));
    }
  }, [user, domain]);

  const handleCheckout = useCallback(async () => {
    if (product) {
      if (!product.recurring) {
        const stripeUrl = product.paymentsUrls?.[currency];
        if (stripeUrl) {
          window.location.assign(stripeUrl);
        }
      } else {
        const session = await createCheckoutSession(
          product.plan,
          currency,
          language.stripeLocale,
          !product.seats ? domain : null
        );

        if (session && stripe) {
          await stripe.redirectToCheckout({
            sessionId: session.id,
          });
        }
      }
    }
  }, [stripe, product, currency, domain, language]);

  const validForm = (!needDomain || validDomain) && !!product && !needLogin;

  return (
    <Container>
      <Header>Retrospected Pro</Header>
      {user && user.pro && !user.subscriptionsId ? (
        <Alert severity="info">{translations.alertAlreadyPro}</Alert>
      ) : null}
      {user && user.subscriptionsId && !user.trial ? (
        <Alert severity="info">{translations.alertAlreadySubscribed}</Alert>
      ) : null}

      <Step
        index={1}
        title={translations.plan.title}
        description={translations.plan.description}
      >
        <ProductPicker
          value={plan}
          products={products}
          currency={currency}
          onChange={setPlan}
        />
      </Step>
      {needDomain ? (
        <Step
          index={2}
          title={translations.domain.title}
          description={translations.domain.description}
        >
          <Input
            value={domain}
            onChangeValue={setDomain}
            error={!validDomain}
            helperText={!validDomain ? translations.domain.invalidDomain : null}
            required
          />
        </Step>
      ) : null}
      <Step
        index={needDomain ? 3 : 2}
        title={translations.currency.title}
        description={translations.currency.description}
      >
        {user && !!user.currency ? (
          <Alert severity="warning" style={{ marginBottom: 10 }}>
            {translations.currency.warning!(currency.toUpperCase())}
          </Alert>
        ) : null}
        <CurrencyPicker
          disabled={(user && !!user.currency) || false}
          value={currency}
          onChange={setCurrency}
        />
      </Step>

      <Step
        index={needDomain ? 4 : 3}
        title={`${translations.subscribe.title} ${
          product ? ` - ${product.name}` : ''
        }`}
        description={translations.subscribe.description}
      >
        {needLogin ? (
          <Alert severity="info" style={{ marginBottom: 10 }}>
            {translations.subscribe.cannotRegisterWithAnon}
          </Alert>
        ) : null}
        <Button
          onClick={handleCheckout}
          variant="contained"
          color="primary"
          disabled={!validForm}
        >
          {translations.subscribe.checkout}
        </Button>
      </Step>
    </Container>
  );
}

const Container = styled.div``;
const Header = styled.div`
  border: 1px solid ${grey[200]};
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  display: flex;
  background-color: ${deepPurple[50]};
  color: ${deepPurple[700]};
  font-size: 3rem;
  font-weight: 100;
  justify-content: center;

  @media screen and (max-width: 600px) {
    font-size: 1.5em;
  }

  @media screen and (max-width: 450px) {
    padding: 5px;
  }
`;

export default SubscriberPage;
