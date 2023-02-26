import React from 'react';
import Slider, { Settings } from 'react-slick';
import Container from '@/common/components/UI/Container';
import NextImage from '@/common/components/NextImage';
import Text from '@/common/components/Text';
import Section, { Title, SliderWrapper, Figure } from './clients.style';
import { useTranslation } from 'next-i18next';
import adidas from './adidas.png';
import amazon from './amazon.png';
import barclays from './barclays.png';
import deloitte from './deloitte.png';
import delta from './delta.png';
import expedia from './expedia.png';
import ibm from './ibm.png';
import natwest from './natwest.png';
import novartis from './novartis.png';
import pwc from './pwc.png';
import siemens from './siemens.png';
import vodafone from './vodafone.png';
import dbahn from './db.png';

type ImageType = typeof vodafone;

const clients: ImageType[] = [
  dbahn,
  adidas,
  amazon,
  barclays,
  deloitte,
  delta,
  expedia,
  ibm,
  natwest,
  novartis,
  pwc,
  siemens,
  // target,
  // vodafone,
];

const settings: Settings = {
  className: 'center',
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  centerMode: true,
  arrows: false,
  dots: true,
  responsive: [
    {
      breakpoint: 10000, // a unrealistically big number to cover up greatest screen resolution
      settings: 'unslick',
    },
    {
      breakpoint: 2400,
      settings: {
        slidesToShow: 8,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ],
};

const Clients = () => {
  const { t } = useTranslation();

  return (
    <Section>
      <Container width="1400px">
        <Title>
          <Text content={t('Clients.main')} />
        </Title>
        <SliderWrapper>
          <Slider {...settings}>
            {clients.map((client, i) => (
              <Figure key={i}>
                <NextImage
                  src={client}
                  alt="logo"
                  width={128}
                  placeholder="blur"
                />
              </Figure>
            ))}
          </Slider>
        </SliderWrapper>
      </Container>
    </Section>
  );
};

export default Clients;
