import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
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
import { useTranslation } from 'next-i18next/pages';
import colors from '@/common/theme/webAppCreative/colors';

type HowTo = {
  id: number;
  icon: React.ReactNode;
};

const iconSize = 60;

// Font Awesome's stylesheet (bundled by the Next 15 production build) sets
// `.svg-inline--fa { height: 1em }`, which squashes a width-only icon down
// to the body font size. An inline height wins over that rule.
function FeatureIcon({ icon }: { icon: IconDefinition }) {
  return (
    <FontAwesomeIcon
      icon={icon}
      color={colors.primary}
      width={iconSize}
      style={{ width: iconSize, height: 'auto' }}
    />
  );
}

export const howTos: HowTo[] = [
  { id: 1, icon: <FeatureIcon icon={faFaceSmile} /> },
  { id: 2, icon: <FeatureIcon icon={faLanguage} /> },
  { id: 3, icon: <FeatureIcon icon={faScrewdriverWrench} /> },
  { id: 4, icon: <FeatureIcon icon={faCloudArrowUp} /> },
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
