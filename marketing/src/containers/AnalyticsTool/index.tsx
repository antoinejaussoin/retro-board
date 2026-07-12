import React from 'react';
import Fade from '@/shims/Fade';
import { Icon } from 'react-icons-kit';
import { check } from 'react-icons-kit/feather/check';
import { ic_keyboard_arrow_right } from 'react-icons-kit/md/ic_keyboard_arrow_right';
import Container from '@/common/components/UI/Container';
import NextImage from '@/common/components/NextImage';
import Button from '@/common/components/Button';
import Text from '@/common/components/Text';
import Link from '@/common/components/Link';
import Heading from '@/common/components/Heading';
import analytics from './modified.svg';
import Section, { Grid, Figure, Content, Features } from './analytics.style';
import { useTranslation } from 'next-i18next/pages';
import NextLink from 'next/link';

const AnalyticsTool = () => {
  const { t } = useTranslation();
  return (
    <Section id="self-hosting">
      <Container width="1400px">
        <Grid>
          <Fade up>
            <Figure>
              <NextImage src={analytics} alt="analytics" />
            </Figure>
          </Fade>
          <Content>
            <Text className="subtitle" content={t('SelfHosted.slogan')} />
            <Heading content={t('SelfHosted.title')} />
            <Text className="description" content={t('SelfHosted.desc')} />
            <Features>
              {(
                t('SelfHosted.features', { returnObjects: true }) as string[]
              ).map((feat, i) => (
                <li key={i}>
                  <Icon icon={check} size={22} />
                  {feat}
                </li>
              ))}
            </Features>
            <NextLink href="/blog/self-hosting" className="explore">
              <Button
                title={t('SelfHosted.button.label')!}
                icon={<Icon icon={ic_keyboard_arrow_right} size={24} />}
              />
            </NextLink>
          </Content>
        </Grid>
      </Container>
    </Section>
  );
};

export default AnalyticsTool;
