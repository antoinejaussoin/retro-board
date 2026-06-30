import { useState } from 'react';
import Fade from 'react-reveal/Fade';
import Container from '@/common/components/UI/Container';
import Heading from '@/common/components/Heading';
import Button from '@/common/components/Button';
import Text from '@/common/components/Text';
import pricingFree from './pricing-free.svg';
import pricingPro from './pricing-team.svg';
import pricingUnlimited from './pricing-unlimited.svg';
import pricingHosted from './pricing-self-hosted.svg';
import {
  Section,
  SectionHeading,
  SwitcherWrapper,
  Grid,
  PriceTable,
  Features,
  FreeDescription,
  StrikethroughPrice,
} from './pricing.style';
import { useTranslation } from 'next-i18next';
import { StaticImageData } from 'next/image';
import { useConfig } from '@/common/hooks/useConfig';

type Pricing = {
  id: number;
  key: string;
  isActive: boolean;
  title: string;
  features: string;
  icon: StaticImageData;
  isSubscribe: boolean;
  recurrent: boolean;
};

export const pricing: Pricing[] = [
  {
    id: 1,
    key: 'basic',
    isActive: false,
    title: 'Pricing.basic.title',
    features: 'Pricing.basic.features',
    icon: pricingFree,
    isSubscribe: false,
    recurrent: true,
  },
  {
    id: 2,
    key: 'pro',
    isActive: false,
    title: 'Pricing.pro.title',
    features: 'Pricing.pro.features',
    icon: pricingPro,
    isSubscribe: true,
    recurrent: true,
  },
  {
    id: 3,
    key: 'unlimited',
    isActive: true,
    title: 'Pricing.unlimited.title',
    features: 'Pricing.unlimited.features',
    icon: pricingUnlimited,
    isSubscribe: true,
    recurrent: true,
  },
  {
    id: 4,
    key: 'hosted',
    isActive: false,
    title: 'Pricing.hosted.title',
    features: 'Pricing.hosted.features',
    icon: pricingHosted,
    isSubscribe: true,
    recurrent: false,
  },
];

function toOriginalPrice(currency: string, price: string) {
  return <>{currency + (parseFloat(price) * 12).toFixed(2)}</>;
}

function toPrice(
  currency: string,
  priceStr: string,
  yearly: boolean,
  recurrent: boolean,
  recurrentWord: string,
  freeWord: string
): React.ReactNode {
  const price = parseFloat(priceStr);

  if (price === 0) {
    return <span data-pricing-amount>{freeWord}</span>;
  }

  const amount = currency + (price * (yearly && recurrent ? 11 : 1)).toFixed(2);

  return (
    <>
      <span data-pricing-amount>{amount}</span>
      {recurrent ? <em data-pricing-period>{recurrentWord}</em> : null}
    </>
  );
}

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const { t } = useTranslation();
  const { appUrl } = useConfig();
  const currency = t('Pricing.currency');
  const freeWord = t('Pricing.free');
  const monthlyWord = t('Pricing.perMonth');
  const yearlyWord = t('Pricing.perYear');
  const monthlyBanner = t('Pricing.switchToYearly');
  const yearlyBanner = t('Pricing.switchedToYearly');

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <Section
      id="pricing"
      data-pricing-root
      data-pricing-currency={currency}
      data-pricing-free={freeWord}
      data-pricing-monthly-word={monthlyWord}
      data-pricing-yearly-word={yearlyWord}
      data-pricing-monthly-banner={monthlyBanner}
      data-pricing-yearly-banner={yearlyBanner}
    >
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Pricing.heading')} />
          <Text content={t('Pricing.weAccept')} />
        </SectionHeading>
        <SwitcherWrapper>
          <button
            type="button"
            data-pricing-mode="monthly"
            className={isMonthly ? 'active' : undefined}
            onClick={() => setIsMonthly(true)}
          >
            {t('Pricing.monthly')}
          </button>
          <span
            className="switcher"
            data-pricing-toggle
            onClick={handleToggle}
            role="button"
            title="Switch between monthly and yearly"
          >
            <span
              data-pricing-toggle-knob
              className={`switcher-button ${isMonthly ? 'left' : 'right'}`}
            />
          </span>
          <button
            type="button"
            data-pricing-mode="yearly"
            className={!isMonthly ? 'active' : undefined}
            onClick={() => setIsMonthly(false)}
          >
            {t('Pricing.yearly')}
          </button>
        </SwitcherWrapper>
        <FreeDescription data-pricing-banner>
          {isMonthly ? (
            <span>🎁 {t('Pricing.switchToYearly')}</span>
          ) : (
            <span>{t('Pricing.switchedToYearly')} 🎉</span>
          )}
        </FreeDescription>
        <Grid>
          {pricing.map((priceTable) => {
            const key = `Pricing.${priceTable.key}`;
            const plus = t(`${key}.plus`);
            return (
              <Fade key={priceTable.id} up delay={priceTable.id * 100}>
                <PriceTable
                  data-pricing-card
                  data-pricing-price={t(`${key}.price`)}
                  data-pricing-recurrent={String(priceTable.recurrent)}
                  data-pricing-subscribe={String(priceTable.isSubscribe)}
                  className={
                    priceTable.isActive
                      ? 'active animate__animated animate__fadeInUp'
                      : 'animate__animated animate__fadeInUp'
                  }
                >
                  <Heading content={t(`${key}.title`)} />
                  <Heading
                    as="h3"
                    content={toPrice(
                      t('Pricing.currency'),
                      t(`${key}.price`),
                      !isMonthly,
                      priceTable.recurrent,
                      isMonthly ? t(`Pricing.perMonth`) : t(`Pricing.perYear`),
                      t(`Pricing.free`)
                    )}
                  />
                  <StrikethroughPrice
                    data-pricing-original-wrapper
                    style={{
                      visibility:
                        !isMonthly &&
                        priceTable.recurrent &&
                        priceTable.isSubscribe
                          ? 'visible'
                          : 'hidden',
                    }}
                  >
                    <span data-pricing-original>
                      {toOriginalPrice(currency, t(`${key}.price`))}
                    </span>
                  </StrikethroughPrice>

                  <Features>
                    {plus ? (
                      <Text content={plus} style={{ fontWeight: 'bold' }} />
                    ) : null}

                    {(
                      t(`${key}.features`, { returnObjects: true }) as string[]
                    ).map((f, i) => (
                      <Text content={f} key={i} />
                    ))}
                  </Features>

                  {/* <Figure>
                    <NextImage src={priceTable.icon} alt={t(`${key}.title`)} />
                  </Figure> */}
                  <a
                    href={
                      priceTable.isSubscribe ? `${appUrl}/subscribe` : appUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      title={
                        priceTable.isSubscribe
                          ? t('Pricing.subscribe')!
                          : t('Pricing.login')!
                      }
                    />
                  </a>
                  {/* <a className="link" href={"todo"}>
                  {priceTable.details.label}{' '}
                  <Icon size={20} icon={ic_keyboard_arrow_right} />
                </a> */}
                </PriceTable>
              </Fade>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
};

export default Pricing;
