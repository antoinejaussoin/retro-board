import Container from '@/common/components/UI/Container';
import NextImage from '@/common/components/NextImage';
import Text from '@/common/components/Text';
import Heading from '@/common/components/Heading';
import Section, { SectionHeading, SupportedApps } from './integration.style';
import github from '@/common/assets/image/webAppCreative/icons/github.png';
import google from './google.png';
import slack2 from './slack.png';
import twitter from './twitter.png';
import markdown from './markdown.png';
import microsoft from './microsoft.png';
import okta from './okta.png';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

export const appIntegration = [
  {
    id: 2,
    icon: google,
    name: 'googleCloud',
    bgColor: '#fff',
    isBlurred: false,
  },
  {
    id: 3,
    icon: slack2,
    name: 'slack',
    bgColor: '#fff',
    isBlurred: false,
  },
  {
    id: 7,
    icon: github,
    name: 'github',
    bgColor: '#fff',
    isBlurred: false,
  },
  {
    id: 9,
    icon: markdown,
    name: 'Markdown',
    bgColor: '#fff',
    isBlurred: false,
  },
  {
    id: 10,
    icon: microsoft,
    name: 'Microsoft',
    bgColor: '#fff',
    isBlurred: false,
  },
  {
    id: 11,
    icon: okta,
    name: 'Okta',
    bgColor: '#fff',
    isBlurred: false,
  },
];

const Integrations = () => {
  const { t } = useTranslation();
  return (
    <Section>
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Integration.heading')} />
          <Text content={t('Integration.description')} />
        </SectionHeading>
        <SupportedApps>
          {appIntegration.map((app) => (
            <Figure
              key={app.id}
              className={app.isBlurred ? 'blurred' : undefined}
              style={{ backgroundColor: app.bgColor ?? undefined }}
            >
              <NextImage src={app.icon} alt={app.name} width={72} />
            </Figure>
          ))}
        </SupportedApps>
      </Container>
    </Section>
  );
};

const Figure = styled.figure``;

export default Integrations;
