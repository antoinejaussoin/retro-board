import styled from 'styled-components';
import phoneIcon from './phone.svg';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function Callback() {
  const { t } = useTranslation();
  return (
    <Container href="https://forms.gle/tKpjtu1rLk9qqTBE7" target="_blank">
      <Icon src={phoneIcon} alt="phone" height={20} />
      <span>{t('Callback.message')}</span>
    </Container>
  );
}

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
  }
  cursor: pointer;
  z-index: 1000;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

  @media (max-width: 767px) {
    width: 100%;
    bottom: 0;
    margin: 0;
    right: 0;
    left: 0;
    border-radius: 0;
    box-shadow: none;
  }
`;

const Icon = styled(Image)``;
