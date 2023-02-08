import Container from '../../../common/components/UI/Container';
import NextImage from '../../../common/components/NextImage';
import Text from '../../../common/components/Text';
import Heading from '../../../common/components/Heading';
import Section, { SectionHeading, SupportedApps } from './integration.style';

import { appIntegration } from '../../../common/data/WebAppCreative';

const Integrations = () => {
  return (
    <Section>
      <Container width="1400px">
        <SectionHeading>
          <Heading content={appIntegration.sectionTitle} />
          <Text content={appIntegration.sectionDesc} />
        </SectionHeading>
        <SupportedApps>
          {appIntegration.apps.map((app) => (
            <figure
              key={app.id}
              className={app.isBlurred ? 'blurred' : undefined}
              style={{ backgroundColor: app.bgColor ?? undefined }}
            >
              <NextImage src={app.icon} alt={app.name} />
            </figure>
          ))}
        </SupportedApps>
      </Container>
    </Section>
  );
};

export default Integrations;
