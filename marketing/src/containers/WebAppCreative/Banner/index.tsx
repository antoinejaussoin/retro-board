import Container from '../../../common/components/UI/Container';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import Button from '../../../common/components/Button';
import NextImage from '../../../common/components/NextImage';
import Section, {
  BannerContentWrapper,
  BannerContent,
  Subscribe,
  Figure,
} from './banner.style';
import screenshot from './mockup-1-02.webp';
import { useTranslation } from 'next-i18next';
import { useConfig } from '@/common/hooks/useConfig';

const Banner = () => {
  const { t } = useTranslation('common');
  const { appUrl } = useConfig();
  return (
    <Section id="home">
      <Container width="1400px">
        <BannerContentWrapper>
          <BannerContent>
            <Heading
              className="animate__animated animate__fadeInUp"
              content={t('Banner.heading')}
            />
            <Text
              className="animate__animated animate__fadeInUp"
              content={t('Banner.text')}
            />
            <Subscribe className="animate__animated animate__fadeInUp">
              <a href={appUrl}>
                <Button title={t('Banner.subscribeToday')!} type="submit" />
              </a>
            </Subscribe>
          </BannerContent>
          <Figure className="animate__animated animate__fadeInUp animate__fast">
            <NextImage
              src={screenshot}
              alt="dashboard"
              width={1280}
              height={720}
              priority
              placeholder="blur"
            />
          </Figure>
        </BannerContentWrapper>
      </Container>
    </Section>
  );
};

export default Banner;
