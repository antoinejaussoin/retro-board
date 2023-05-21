import Container from '@/common/components/UI/Container';
import Heading from '@/common/components/Heading';
import Text from '@/common/components/Text';
import Button from '@/common/components/Button';
import NextImage from '@/common/components/NextImage';
import Section, {
  BannerContentWrapper,
  BannerContent,
  Subscribe,
  Figure,
  Buttons,
} from './banner.style';
import screenshot from './mockup.png';
import { useTranslation } from 'next-i18next';
import { useConfig } from '@/common/hooks/useConfig';
import dashboardPattern from '@/common/assets/image/webAppCreative/dashboard-pattern.png';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { Fragment } from 'react';

const Banner = () => {
  const { locale } = useRouter();
  const { t } = useTranslation('common');
  const { appUrl } = useConfig();
  return (
    <Section id="home">
      <Container>
        <BannerContentWrapper>
          <BannerContent>
            <Heading
              className="animate__animated animate__fadeInUp"
              content={
                <ReactMarkdown
                  components={{
                    p: Fragment,
                  }}
                >
                  {t('Banner.heading')}
                </ReactMarkdown>
              }
            />
            <Text
              className="animate__animated animate__fadeInUp"
              content={
                <ReactMarkdown
                  components={{
                    p: Fragment,
                  }}
                >
                  {t('Banner.text')}
                </ReactMarkdown>
              }
            />
            <Buttons>
              <Subscribe className="animate__animated animate__fadeInUp">
                <a href={appUrl} data-ga="try-button">
                  <Button
                    colors="secondaryWithBg"
                    title={t('Banner.subscribeToday')!}
                  />
                </a>
              </Subscribe>
              <Subscribe className="animate__animated animate__fadeInUp">
                <a
                  href={appUrl + '/demo?lang=' + locale}
                  target="_blank"
                  rel="noreferrer"
                  data-ga="demo-button"
                >
                  <Button
                    title={t('Banner.demo')!}
                    variant="outlined"
                    colors="secondary"
                  />
                </a>
              </Subscribe>
            </Buttons>
          </BannerContent>
          <Figure className="animate__animated animate__fadeInUp animate__fast">
            <NextImage
              alt="Background image"
              src={dashboardPattern}
              placeholder="blur"
              className="background"
              quality={50}
              fill
              priority
            />
            <NextImage
              src={screenshot}
              alt="dashboard"
              priority
              placeholder="blur"
              fill
              quality={50}
            />
          </Figure>
        </BannerContentWrapper>
      </Container>
    </Section>
  );
};

export default Banner;
