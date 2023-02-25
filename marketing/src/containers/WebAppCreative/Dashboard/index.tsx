import React from 'react';
import { Tab, TabList, TabPanel } from 'react-tabs';
import Container from '../../../common/components/UI/Container';
import NextImage from '../../../common/components/NextImage';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import Section, {
  SectionHeading,
  ReactTabs,
  Description,
  Figure,
} from './dashboard.style';
import { useTranslation } from 'next-i18next';
import feature1 from './feature1.webp';
import feature2 from './feature2.png';
import feature3 from './feature3.png';
import feature4 from './feature4.png';
import { StaticImageData } from 'next/image';

type Dashboard = {
  id: number;
  image: StaticImageData;
  width?: number;
  height?: number;
};

export const dashboard: Dashboard[] = [
  {
    id: 2,
    image: feature2,
  },
  {
    id: 1,
    image: feature1,
    width: 1007,
    height: 592,
  },
  {
    id: 3,
    image: feature3,
  },
  {
    id: 4,
    image: feature4,
  },
];

const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <Section id="features">
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Features.heading')} />
          <Text content={t('Features.description')} />
        </SectionHeading>
        <ReactTabs>
          <nav>
            <TabList>
              {dashboard.map((tab) => (
                <Tab key={tab.id}>{t(`Features.${tab.id}.title`)}</Tab>
              ))}
            </TabList>
          </nav>

          {dashboard.map((tab) => (
            <TabPanel key={tab.id}>
              <Description>{t(`Features.${tab.id}.description`)}</Description>
              <Figure className="animate__animated animate__fadeInUp">
                <NextImage
                  src={tab.image}
                  alt={t(`Features.${tab.id}.title`)}
                  placeholder="blur"
                  fill
                  style={{ objectFit: 'contain' }}
                  // sizes="(max-width: 768px) 100vw,
                  //         (max-width: 1200px) 50vw,
                  //         33vw"
                  quality={75}
                />
              </Figure>
            </TabPanel>
          ))}
        </ReactTabs>
      </Container>
    </Section>
  );
};

export default Dashboard;
