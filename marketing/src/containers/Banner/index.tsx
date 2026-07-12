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
import { useTranslation } from 'next-i18next/pages';
import { useConfig } from '@/common/hooks/useConfig';
import dashboardPattern from '@/common/assets/image/webAppCreative/dashboard-pattern.png';
import { useRouter } from 'next/router';
import ReactMarkdownImport from 'react-markdown';
const ReactMarkdown = ReactMarkdownImport as any;
import { Fragment, useState } from 'react';
import styled from 'styled-components';
import { YouTubePlayer } from './YouTubePlayer';

const Banner = () => {
  const { locale } = useRouter();
  const { t } = useTranslation('common');
  const { appUrl } = useConfig();
  const [showVideo, setShowVideo] = useState(false);
  return (
    <>
      <Section id="home" onClick={() => setShowVideo(false)}>
        <Container>
          <BannerContentWrapper>
            <BannerContent>
              <Heading
                className="animate__animated animate__fadeInUp"
                content={
                  <ReactMarkdown
                    components={{
                      p: Fragment as any,
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
                      p: Fragment as any,
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
                alt="Screenshot of Retrospected"
                priority
                placeholder="blur"
                fill
                quality={30}
              />
              <PlayOverlay
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  setShowVideo(true);
                }}
              >
                <svg
                  fill="#000000"
                  height="100%"
                  width="100%"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 60 60"
                  xmlSpace="preserve"
                >
                  <g>
                    <path
                      d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30
		c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15
		C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"
                    />
                    <path
                      d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30
		S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"
                    />
                  </g>
                </svg>
              </PlayOverlay>
            </Figure>
          </BannerContentWrapper>
        </Container>
      </Section>
      {showVideo ? (
        <YouTubePlayer
          url="https://www.youtube.com/embed/SpbAaziAwTY"
          onClose={() => setShowVideo(false)}
        />
      ) : null}
    </>
  );
};

const PlayOverlay = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  top: calc(50% - 50px);
  left: calc(50% - 50px);
  text-align: center;
  font-size: 3rem;
  > svg {
    fill: #ccc;
  }
  &:hover {
    svg {
      fill: #ff4361 !important;
    }
  }
  z-index: 1;
  cursor: pointer;
`;

export default Banner;
