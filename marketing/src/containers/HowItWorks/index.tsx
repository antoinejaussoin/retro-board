import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLanguage,
  faScrewdriverWrench,
  faCloudArrowUp,
  faFaceSmile,
} from '@fortawesome/free-solid-svg-icons';
import Container from '@/common/components/UI/Container';
import Heading from '@/common/components/Heading';
import Text from '@/common/components/Text';
import Section, { SectionHeading, Grid, Item } from './howItWorks.style';
import { useTranslation } from 'next-i18next';
import colors from '@/common/theme/webAppCreative/colors';

type HowTo = {
  id: number;
  icon: React.ReactNode;
};

const iconSize = 60;

export const howTos: HowTo[] = [
  {
    id: 1,
    icon: (
      <FontAwesomeIcon
        icon={faFaceSmile}
        color={colors.primary}
        width={iconSize}
      />
    ),
  },
  {
    id: 2,
    icon: (
      <FontAwesomeIcon
        icon={faLanguage}
        color={colors.primary}
        width={iconSize}
      />
    ),
  },
  {
    id: 3,
    icon: (
      <FontAwesomeIcon
        icon={faScrewdriverWrench}
        color={colors.primary}
        width={iconSize}
      />
    ),
  },
  {
    id: 4,
    icon: (
      <FontAwesomeIcon
        icon={faCloudArrowUp}
        color={colors.primary}
        width={iconSize}
      />
    ),
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
              <figure>{howTo.icon}</figure>
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
