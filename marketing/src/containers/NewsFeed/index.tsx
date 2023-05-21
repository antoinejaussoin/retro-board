import React from 'react';
import NextLink from 'next/link';
import { Icon } from 'react-icons-kit';
import Fade from 'react-reveal/Fade';
import { arrowRight } from 'react-icons-kit/feather/arrowRight';
import Container from '@/common/components/UI/Container';
import Heading from '@/common/components/Heading';
import NextImage from '@/common/components/NextImage';
import Text from '@/common/components/Text';
import {
  Section,
  SectionHeading,
  Grid,
  Article,
  ImageContainer,
} from './newsFeed.style';
import { useTranslation } from 'next-i18next';
import { BlogMetadata } from '@/lib/getBlog';
import { format, parse } from 'date-fns';
import { localeToDateFns } from '@/common/i18n/locale-for-datefns';

type NewsFeedProps = {
  articles: BlogMetadata[];
  locale: string;
};

export default function NewsFeed({ articles, locale }: NewsFeedProps) {
  const { t } = useTranslation();
  const dateFnsLocale = localeToDateFns(locale);
  return (
    <Section id="newsfeed">
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Newsfeed.heading')} />
        </SectionHeading>
        <Grid>
          {articles.map((post, i) => (
            <Fade key={post.slug} up delay={(i + 1) * 100}>
              <Article>
                <NextLink href={`blog/${post.slug}`}>
                  <ImageContainer style={{ marginBottom: 10 }}>
                    <NextImage src={post.cover} alt={post.title} fill />
                  </ImageContainer>
                </NextLink>
                <Text
                  content={format(
                    parse(post.date, 'yyyy-MM-dd', new Date()),
                    'PPPP',
                    { locale: dateFnsLocale }
                  )}
                />
                <Heading as="h4" content={post.title} />
                <NextLink href={`blog/${post.slug}`}>
                  {post.subtitle} <Icon icon={arrowRight} />
                </NextLink>
              </Article>
            </Fade>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
