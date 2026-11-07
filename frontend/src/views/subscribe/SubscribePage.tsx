import { useStripe } from '@stripe/react-stripe-js';
import { find } from 'lodash';
import queryString from 'query-string';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Currency, FullUser, Plan } from 'common';
import Input from '../../components/Input';
import useUser from '../../state/user/useUser';
import { useLanguage } from '../../translations';
import { trackEvent } from 'track';
import { Page } from 'components/Page';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { Checkbox } from 'ui/checkbox';
import { createCheckoutSession, isValidDomain } from './api';
import CurrencyPicker from './components/CurrencyPicker';
import ProductPicker from './components/ProductPicker';
import Step from './components/Step';
import useProducts from './components/useProducts';

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
          yearly,
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

  type StepRenderer = (index: number) => ReactElement;

  const steps = (
    [
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

          <div className="mt-4">
            <Checkbox
              checked={yearly}
              onCheckedChange={setYearly}
              label={`🎁  ${t('Products.wantToPayYearly')}`}
            />
          </div>
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
                required
                fullWidth
                aria-invalid={!validDomain}
                className={!validDomain ? 'border-red-400' : undefined}
              />
              {!validDomain ? (
                <p className="mt-1 text-sm text-red-700">
                  {t('SubscribePage.domain.invalidDomain')}
                </p>
              ) : null}
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
            <Alert severity="warning" className="mb-3">
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
            <Alert severity="info" className="mb-3">
              {t('SubscribePage.subscribe.cannotRegisterWithAnon')}
            </Alert>
          ) : null}
          <Button onClick={handleCheckout} disabled={!validForm}>
            {t('SubscribePage.subscribe.checkout')}
          </Button>
        </Step>
      ),
    ] as Array<StepRenderer | null>
  ).filter((step): step is StepRenderer => step !== null);

  return (
    <Page>
      <div className="flex flex-col gap-6">
        <h1 className="text-center text-3xl font-medium tracking-tight">
          Retrospected Pro
        </h1>
        {user && user.pro ? (
          <Alert severity="info">{t('SubscribePage.alertAlreadyPro')}</Alert>
        ) : null}
        {user && !!user.plan && !user.trial ? (
          <Alert severity="info">
            {t('SubscribePage.alertAlreadySubscribed')}
          </Alert>
        ) : null}

        {steps.map((step, index) => (
          <div key={index}>{step(index + 1)}</div>
        ))}
      </div>
    </Page>
  );
}

export default SubscriberPage;
