import { useMemo, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import queryString from 'query-string';
import { createCheckoutSession, isValidDomain } from './api';
import { useCallback } from 'react';
import styled from '@emotion/styled';
import Step from './components/Step';
import Button from '@mui/material/Button';
import { colors, FormControlLabel, Switch } from '@mui/material';
import { Currency, FullUser, Plan } from 'common';
import CurrencyPicker from './components/CurrencyPicker';
import ProductPicker from './components/ProductPicker';
import Input from '../../components/Input';
import useUser from '../../state/user/useUser';
import { Alert } from '@mui/material';
import { useEffect } from 'react';
import { useLanguage } from '../../translations';
import { useTranslation } from 'react-i18next';
import useProducts from './components/useProducts';
import { find } from 'lodash';
import { trackEvent } from 'track';

function guessDomain(user: FullUser): string {
  if (user.email) {
    const parts = user.email.split('SubscribePage.@');
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
    : 'team';
  const [currency, setCurrency] = useState<Currency>('eur');
  const [plan, setPlan] = useState<Plan | null>(defaultProduct);
  const [yearly, setYearly] = useState(false);
  const product = useMemo(() => {
    if (!plan || !products) {
      return null;
    }
    return find(products, (p) => p.plan === plan) || null;
  }, [plan, products]);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
  const stripe = useStripe();
  const { t } = useTranslation();
  const [language] = useLanguage();
  const needDomain = product && product.plan === 'unlimited';
  const needLogin =
    !!product &&
    product.plan !== 'self-hosted' &&
    (!user || user.accountType === 'anonymous');
  const [validDomain, setValidDomain] = useState(false);

  useEffect(() => {
    trackEvent('subscribe/initial');
  }, []);

  useEffect(() => {
    setValidDomain(false);
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,20}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})$/g;
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
      trackEvent('subscribe/launch-stripe');
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
          !product.seats ? domain : null,
          yearly
        );

        if (session && stripe) {
          await stripe.redirectToCheckout({
            sessionId: session.id,
          });
        }
      }
    }
  }, [stripe, product, currency, domain, language, yearly]);

  const validForm = (!needDomain || validDomain) && !!product && !needLogin;

  const steps = [
    (index: number) => (
      <Step
        index={index}
        title={t('SubscribePage.plan.title')!}
        description={t('SubscribePage.plan.description')!}
      >
        <ProductPicker
          value={plan}
          products={products}
          currency={currency}
          yearly={yearly}
          onChange={setPlan}
        />

        <FormControlLabel
          style={{ marginLeft: 16 }}
          control={
            <Switch
              checked={yearly}
              onChange={(evt) => setYearly(evt.target.checked)}
              name="yearly"
              size="medium"
            />
          }
          label={`🎁  ${t('Products.wantToPayYearly')}`}
        />
      </Step>
    ),
    needDomain
      ? (index: number) => (
          <Step
            index={index}
            title={t('SubscribePage.domain.title')!}
            description={t('SubscribePage.domain.description')!}
          >
            <Input
              value={domain}
              onChangeValue={setDomain}
              error={!validDomain}
              helperText={
                !validDomain ? t('SubscribePage.domain.invalidDomain') : null
              }
              required
            />
          </Step>
        )
      : null,
    (index: number) => (
      <Step
        index={index}
        title={t('SubscribePage.currency.title')!}
        description={t('SubscribePage.currency.description')!}
      >
        {user && !!user.currency ? (
          <Alert severity="warning" style={{ marginBottom: 10 }}>
            {t('SubscribePage.currency.warning', {
              currency: currency.toUpperCase(),
            })}
          </Alert>
        ) : null}
        <CurrencyPicker
          disabled={(user && !!user.currency) || false}
          value={currency}
          onChange={setCurrency}
        />
      </Step>
    ),
    (index: number) => (
      <Step
        index={index}
        title={`${t('SubscribePage.subscribe.title')} ${
          product ? ` - ${product.name}` : ''
        }`}
        description={t('SubscribePage.subscribe.description')!}
      >
        {needLogin ? (
          <Alert severity="info" style={{ marginBottom: 10 }}>
            {t('SubscribePage.subscribe.cannotRegisterWithAnon')}
          </Alert>
        ) : null}
        <Button
          onClick={handleCheckout}
          variant="contained"
          color="primary"
          disabled={!validForm}
        >
          {t('SubscribePage.subscribe.checkout')}
        </Button>
      </Step>
    ),
  ].filter(Boolean);

  return (
    <Container>
      <Header>Retrospected Pro</Header>
      {user && user.pro ? (
        <Alert severity="info">{t('SubscribePage.alertAlreadyPro')}</Alert>
      ) : null}
      {user && !!user.plan && !user.trial ? (
        <Alert severity="info">
          {t('SubscribePage.alertAlreadySubscribed')}
        </Alert>
      ) : null}

      {steps.map((step, index) => {
        return step(index + 1);
      })}
    </Container>
  );
}

const Container = styled.div``;
const Header = styled.div`
  border: 1px solid ${colors.grey[200]};
  border-radius: 10px;
  margin: 10px;
  padding: 20px;
  display: flex;
  background-color: ${colors.deepPurple[50]};
  color: ${colors.deepPurple[700]};
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
