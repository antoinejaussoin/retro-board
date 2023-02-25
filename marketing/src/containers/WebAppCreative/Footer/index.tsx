import { Icon } from 'react-icons-kit';
import { ic_place } from 'react-icons-kit/md/ic_place';
import { ic_phone } from 'react-icons-kit/md/ic_phone';
import { paperPlane } from 'react-icons-kit/fa/paperPlane';
import Container from '../../../common/components/UI/Container';
import Heading from '../../../common/components/Heading';
import Image from '../../../common/components/Image';
import Text from '../../../common/components/Text';
import Link from '../../../common/components/Link';
import {
  Section,
  Grid,
  AboutUs,
  FooterWidget,
  ContactInfo,
  InfoItem,
  FooterBottom,
  FooterNav,
  SocialLinks,
} from './footer.style';
import NextImage from '@/common/components/NextImage';
import siteLogo from '../Navbar/logo.png';
import facebook from '../../../common/assets/image/webAppCreative/icons/facebook.png';
import twitter from '../../../common/assets/image/webAppCreative/icons/twitter.png';
import dribbble from '../../../common/assets/image/webAppCreative/icons/dribbble.png';
import { useTranslation } from 'next-i18next';

export const footerTop = {
  about: {
    logo: siteLogo,
    text: `We run Advanced Search reports on the criteria you care about to see how work is progressing and where to focus your effort.`,
  },
  widgets: [
    {
      id: 2,
      title: 'About Us',
      list: [
        {
          id: 1,
          title: 'Support Center',
          link: '#',
        },
        {
          id: 2,
          title: 'Customer Support',
          link: '#',
        },
        {
          id: 3,
          title: 'About Us',
          link: '#',
        },
        {
          id: 4,
          title: 'Copyright',
          link: '#',
        },
        {
          id: 5,
          title: 'Popular Campaign',
          link: '#',
        },
      ],
    },
    {
      id: 3,
      title: 'Our Information',
      list: [
        {
          id: 1,
          title: 'Return Policy ',
          link: '#',
        },
        {
          id: 2,
          title: 'Privacy Policy',
          link: '#',
        },
        {
          id: 3,
          title: 'Terms & Conditions',
          link: '#',
        },
        {
          id: 4,
          title: 'Site Map',
          link: '#',
        },
        {
          id: 5,
          title: 'Store Hours',
          link: '#',
        },
      ],
    },
    {
      id: 4,
      title: 'My Account',
      list: [
        {
          id: 1,
          title: 'Press inquiries',
          link: '#',
        },
        {
          id: 2,
          title: 'Social media ',
          link: '#',
        },
        {
          id: 3,
          title: 'directories',
          link: '#',
        },
        {
          id: 4,
          title: 'Images & B-roll',
          link: '#',
        },
        {
          id: 5,
          title: 'Permissions',
          link: '#',
        },
      ],
    },
  ],
  contactInfo: {
    title: 'Contact info',
    address: `Mohakhali DOHS, Amsterdam, Netherlands`,
    phone: `+31 62 19 22 705`,
    openingTime: `7 Days - 8am - 10pm`,
    email: `info@redqteam.com`,
  },
};

export const footer = {
  copyright: `Copyright © ${new Date().getFullYear()} Superprops. All rights reserved`,
  nav: [
    {
      id: 1,
      title: 'Support',
      link: '#',
    },
    {
      id: 2,
      title: 'Hiring',
      link: '#',
    },
    {
      id: 3,
      title: 'Privacy',
      link: '#',
    },
    {
      id: 4,
      title: 'Terms',
      link: '#',
    },
  ],
  socialLinks: [
    {
      id: 1,
      link: 'http://facebook.com',
      icon: facebook,
      label: 'Facebook',
    },
    {
      id: 2,
      link: 'http://twitter.com',
      icon: twitter,
      label: 'Twitter',
    },
    {
      id: 3,
      link: 'http://dribbble.com',
      icon: dribbble,
      label: 'Dribbble',
    },
  ],
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <Section>
      <Container width="1400px">
        <Grid>
          <AboutUs>
            <NextImage src={siteLogo} alt="Logo Retrospected" />
            <Text content={t('Footer.about')} />
          </AboutUs>
          {/* {footerTop.widgets.map((item) => (
            <FooterWidget key={item.id}>
              <h4>{item.title}</h4>
              <ul>
                {item.list.map((item) => (
                  <li className="widgetListItem" key={item.id}>
                    <Link href={item.link}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </FooterWidget>
          ))} */}
          <ContactInfo>
            <Heading as="h4" content={t('Contact.title')} />
            <InfoItem>
              <Icon icon={ic_place} size={24} />
              <div>
                <Text content={t('Contact.address')} />
                <Text content="Registered in England & Wales: 13624961." />
              </div>
            </InfoItem>
            {/* <InfoItem>
              <Icon icon={ic_phone} size={26} className="phone-icon" />
              <div>
                <Text className="phone-number" content={t('Contact.phone')} />
                <Text content={t('Contact.openingTime')} />
              </div>
            </InfoItem> */}
            <InfoItem>
              <Icon icon={paperPlane} size={22} />
              <a href="mailto:support@retrospected.com">
                <Text content={t('Contact.email')} />
              </a>
            </InfoItem>
          </ContactInfo>
        </Grid>
      </Container>
      <Container width="1400px">
        <FooterBottom>
          <Text content={t('Footer.copyright')} />
          {/* <FooterNav>
            {footer.nav.map((item) => (
              <li key={item.id}>
                <Link href={item.link}>{item.title}</Link>
              </li>
            ))}
          </FooterNav> */}
          {/* <SocialLinks>
            <span>Social:</span>
            <ul>
              {footer.socialLinks.map((item) => (
                <li key={item.id}>
                  <Link href={item.link}>
                    <NextImage src={item.icon?.src} alt={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </SocialLinks> */}
        </FooterBottom>
      </Container>
    </Section>
  );
};

export default Footer;
