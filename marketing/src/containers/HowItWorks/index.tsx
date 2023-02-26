import React from 'react';
// import { Icon } from 'react-icons-kit'; TODO !!!!
// import { arrowRight } from 'react-icons-kit/feather/arrowRight';
import Container from '@/common/components/UI/Container';
import NextImage from '@/common/components/NextImage';
// import Link from '@/common/components/Link';
import Heading from '@/common/components/Heading';
import Text from '@/common/components/Text';
import Section, { SectionHeading, Grid, Item } from './howItWorks.style';
import icon1 from '@/common/assets/image/webAppCreative/icons/1.png';
import icon2 from '@/common/assets/image/webAppCreative/icons/2.png';
import icon3 from '@/common/assets/image/webAppCreative/icons/3.png';
import icon4 from '@/common/assets/image/webAppCreative/icons/4.png';
import { useTranslation } from 'next-i18next';

type HowTo = {
  id: number;
  icon: any; // TODO
};

export const howTos: HowTo[] = [
  {
    id: 1,
    icon: icon1,
  },
  {
    id: 2,
    icon: icon2,
  },
  {
    id: 3,
    icon: icon3,
  },
  {
    id: 4,
    icon: icon4,
  },
];

const HowItWorks = () => {
  const { t } = useTranslation();
  return (
    <Section id="how-to">
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('HowItWorks.heading')} />
        </SectionHeading>
        <Grid>
          {howTos.map((howTo) => (
            <Item key={howTo.id}>
              <figure>
                <NextImage src={howTo.icon} alt="icon" />
              </figure>
              <Heading as="h4" content={t(`HowItWorks.${howTo.id}.title`)} />
              <Text content={t(`HowItWorks.${howTo.id}.text`)} />
              {/* <Link href={howTo.link}>
                {howTo.linkLabel}
                <Icon icon={arrowRight} />
              </Link> */}
            </Item>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default HowItWorks;
