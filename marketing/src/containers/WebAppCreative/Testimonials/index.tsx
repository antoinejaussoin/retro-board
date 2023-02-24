import React from 'react';
import Container from '../../../common/components/UI/Container';
import Image from '../../../common/components/Image';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';
import Section, {
  SectionHeading,
  ReactSlick,
  Item,
  AuthorInfo,
} from './testimonials.style';
import deloitte from './deloitte.png';
import expedia from './expedia.png';
import db from './db.png';
import { useTranslation } from 'next-i18next';
import NextImage from '@/common/components/NextImage';
import { StaticImageData } from 'next/image';
import styled from 'styled-components';

type Testimonial = {
  id: number;
  logo: StaticImageData;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    logo: deloitte,
  },
  {
    id: 2,
    logo: db,
  },
  {
    id: 3,
    logo: expedia,
  },
];

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: false,
  dots: true,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const Testimonials = () => {
  const { t } = useTranslation();
  return (
    <Section id="testimonial">
      <Container width="1400px">
        <SectionHeading>
          <Heading content={t('Testimonials.heading')} />
        </SectionHeading>
        <ReactSlick {...settings}>
          {testimonials.map((testimonial) => (
            <Item key={testimonial.id}>
              <div>
                <Figure>
                  <NextImage src={testimonial.logo} alt="logo" />
                </Figure>
                <Text
                  as="blockquote"
                  content={t(`Testimonials.${testimonial.id}.quote`)}
                />
              </div>
              <AuthorInfo>
                <Heading
                  as="h4"
                  content={t(`Testimonials.${testimonial.id}.author`)}
                />
                <Text
                  content={t(`Testimonials.${testimonial.id}.designation`)}
                />
              </AuthorInfo>
            </Item>
          ))}
        </ReactSlick>
      </Container>
    </Section>
  );
};

const Figure = styled.figure`
  img {
    width: 100%;
    height: 100%;
  }
`;

export default Testimonials;
