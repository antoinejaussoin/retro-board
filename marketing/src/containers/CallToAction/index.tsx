import Container from '@/common/components/UI/Container';
import Heading from '@/common/components/Heading';
import Text from '@/common/components/Text';
import Section, { Content } from './cta.style';
import bubble1 from '@/common/assets/image/webAppCreative/cta-bubble-1.png';
import bubble2 from '@/common/assets/image/webAppCreative/cta-bubble-2.png';
import { useTranslation } from 'next-i18next';
import Button from '@/common/components/Button';
import NextImage from '@/common/components/NextImage';
import { useConfig } from '@/common/hooks/useConfig';

const CallToAction = () => {
  const { t } = useTranslation();
  const { appUrl } = useConfig();

  return (
    <Section>
      <NextImage
        src={bubble1?.src}
        className="bubble-1"
        alt="bubble1"
        width={195}
        height={214}
      />
      <Container width="1400px">
        <Content>
          <Heading content={t('CTA.heading')} />
          <Text content={t('CTA.description')} />
          <a href={appUrl}>
            <Button title={t('CTA.button')!} colors="secondaryWithBg" />
          </a>
          {/* <span>{t('CTA.hint')}</span> */}
        </Content>
      </Container>
      <NextImage
        src={bubble2?.src}
        className="bubble-2"
        alt="bubble2"
        width={202}
        height={257}
      />
    </Section>
  );
};

export default CallToAction;
