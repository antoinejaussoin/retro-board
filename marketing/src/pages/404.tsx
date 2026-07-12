import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'next-i18next/pages';
import styled from 'styled-components';
import Link from 'next/link';
import bg from '../containers/404/bg.gif';
import Image from 'next/image';

export default function Page404() {
  const { t } = useTranslation();
  return (
    <Page>
      <Background src={bg} alt={'background'} />
      <Container>
        <Title>{t('404.heading')}</Title>
        <Description>{t('404.text')}</Description>
        <StyledLink href="/">{t('404.link')}</StyledLink>
      </Container>
    </Page>
  );
}

const Background = styled(Image as any)`
  opacity: 0.5;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90vh;
  font-family: 'Manrope', sans-serif;
`;

const Container = styled.main`
  margin: 20px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 50px 20px 50px;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 4rem;
`;

const Description = styled.p`
  text-align: center;
`;

const StyledLink = styled(Link as any)`
  padding-top: 20px;
  text-align: center;
  color: #e91e63;
  text-decoration: none;
  :hover {
    text-decoration: wavy underline;
  }
`;

export async function getStaticProps({ locale }: { locale?: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
