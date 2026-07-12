import styled from 'styled-components';
import phoneIcon from './phone.svg';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';

const LINK = 'https://forms.gle/tKpjtu1rLk9qqTBE7';

export function Callback() {
  const { t } = useTranslation('common');
  return (
    <Container href={LINK} target="_blank">
      <Image src={phoneIcon} alt="phone" height={20} />
      <Text>{t('Callback.message')}</Text>
    </Container>
  );
}

const Text = styled.span`
  display: none;
  visibility: hidden;
`;

const Container = styled.a`
  font-size: 12px;
  display: flex;
  gap: 15px;
  align-items: center;
  position: fixed;
  bottom: 10px;
  right: 10px;
  border: 1px solid red;
  padding: 10px 20px;
  background-color: hsl(350, 100%, 63%);
  border-radius: 5px;
  color: white;
  :hover {
    background-color: hsl(350, 100%, 55%);
    ${Text} {
      display: inline;
      visibility: visible;
    }
  }
  cursor: pointer;
  z-index: 1000;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

  @media (max-width: 450px) {
    width: 100%;
    bottom: 0;
    margin: 0;
    right: 0;
    left: 0;
    border-radius: 0;
    box-shadow: none;

    ${Text} {
      display: inline;
      visibility: visible;
    }
  }
`;
