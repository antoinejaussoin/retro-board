import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import Fade from 'react-reveal/Fade';
import { ic_keyboard_arrow_right } from 'react-icons-kit/md/ic_keyboard_arrow_right';
import Container from '../../../common/components/UI/Container';
import Heading from '../../../common/components/Heading';
import Button from '../../../common/components/Button';
import Image from '../../../common/components/Image';
import Text from '../../../common/components/Text';
import icecream from '../../../common/assets/image/webAppCreative/icons/icecream.png';
import donut from '../../../common/assets/image/webAppCreative/icons/donut.png';
import pizza from '../../../common/assets/image/webAppCreative/icons/pizza.png';
import {
  Section,
  SectionHeading,
  SwitcherWrapper,
  Grid,
  PriceTable,
} from './pricing.style';
import { useTranslation } from 'next-i18next';

type Pricing = {
  id: number;
  key: string;
  isActive: boolean;
  title: string;
  features: string;
  icon: any;
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
    icon: icecream,
    isSubscribe: false,
    recurrent: true,
  },
  {
    id: 2,
    key: 'pro',
    isActive: false,
    title: 'Pricing.pro.title',
    features: 'Pricing.pro.features',
    icon: donut,
    isSubscribe: true,
    recurrent: true,
  },
  {
    id: 3,
    key: 'unlimited',
    isActive: true,
    title: 'Pricing.unlimited.title',
    features: 'Pricing.unlimited.features',
    icon: pizza,
    isSubscribe: true,
    recurrent: true,
  },
  {
    id: 4,
    key: 'hosted',
    isActive: false,
    title: 'Pricing.hosted.title',
    features: 'Pricing.hosted.features',
    icon: pizza,
    isSubscribe: true,
    recurrent: false,
  },
];

function toPrice(price: string, factor: number) {
  return (parseFloat(price) * factor).toFixed(2);
}

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const { t } = useTranslation();

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <Section id="pricing">
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Pricing.heading')} />
        </SectionHeading>
        <SwitcherWrapper>
          <button className={isMonthly ? 'active' : undefined}>
            {t('Pricing.monthly')}
          </button>
          <span
            className="switcher"
            onClick={handleToggle}
            role="button"
            title="Switch between monthly and yearly"
          >
            <span
              className={`switcher-button ${isMonthly ? 'left' : 'right'}`}
            />
          </span>
          <button className={!isMonthly ? 'active' : undefined}>
            {t('Pricing.yearly')}
          </button>
        </SwitcherWrapper>
        <Grid>
          {pricing.map((priceTable) => {
            const key = `Pricing.${priceTable.key}`;
            return (
              <Fade key={priceTable.id} up delay={priceTable.id * 100}>
                <PriceTable
                  className={
                    priceTable.isActive
                      ? 'active animate__animated animate__fadeInUp'
                      : 'animate__animated animate__fadeInUp'
                  }
                >
                  <Heading
                    content={`${t('Pricing.currency')}${
                      isMonthly
                        ? toPrice(t(`${key}.price`)!, 1)
                        : toPrice(
                            t(`${key}.price`)!,
                            priceTable.recurrent ? 11 : 1
                          )
                    }`}
                  />
                  <Heading as="h6" content={t(`${key}.recurrence`)} />
                  <Heading as="h5" content={t(`${key}.title`)} />

                  {(
                    t(`${key}.features`, { returnObjects: true }) as string[]
                  ).map((f, i) => (
                    <Text content={f} key={i} />
                  ))}

                  <figure>
                    <Image src={priceTable.icon?.src} alt={priceTable.title} />
                  </figure>
                  <Button
                    title={
                      priceTable.isSubscribe
                        ? t('Pricing.subscribe')!
                        : t('Pricing.login')!
                    }
                  />
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
