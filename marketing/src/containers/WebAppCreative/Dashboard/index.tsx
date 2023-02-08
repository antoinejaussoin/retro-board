import React from 'react';
import { Tab, TabList, TabPanel } from 'react-tabs';
import Container from '../../../common/components/UI/Container';
import NextImage from '../../../common/components/NextImage';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import Section, { SectionHeading, ReactTabs } from './dashboard.style';
import dashboardImg from '../../../common/assets/image/webAppCreative/dashboard-2.png';
import { useTranslation } from 'next-i18next';

export const dashboard = {
  tabs: [
    {
      id: 1,
      title: 'Features.feature1',
      content: {
        image: dashboardImg,
      },
    },
    {
      id: 2,
      title: 'Features.feature2',
      content: {
        image: dashboardImg,
      },
    },
    {
      id: 3,
      title: 'Features.feature3',
      content: {
        image: dashboardImg,
      },
    },
    {
      id: 4,
      title: 'Features.feature4',
      content: {
        image: dashboardImg,
      },
    },
  ],
};

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
              {dashboard.tabs.map((tab) => (
                <Tab key={tab.id}>{t(tab.title)}</Tab>
              ))}
            </TabList>
          </nav>

          {dashboard.tabs.map((tab) => (
            <TabPanel key={tab.id}>
              <figure className="animate__animated animate__fadeInUp">
                <NextImage
                  src={tab.content.image}
                  alt={t(tab.title)}
                  placeholder="blur"
                />
              </figure>
            </TabPanel>
          ))}
        </ReactTabs>
      </Container>
    </Section>
  );
};

export default Dashboard;
