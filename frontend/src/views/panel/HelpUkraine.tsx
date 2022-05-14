import styled from '@emotion/styled';
import { Flag } from 'components/Flag';
import { useTranslation } from 'react-i18next';

export function HelpUkraine() {
  const { t } = useTranslation();
  return (
    <HelpUkraineButton
      href="https://www.gov.uk/government/news/ukraine-what-you-can-do-to-help"
      target="_blank"
    >
      <Flag country="ua" />
      {t('Main.helpUkraine')}
    </HelpUkraineButton>
  );
}

const HelpUkraineButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
  font-style: unset;
  text-decoration: unset;
  font-size: 1.2rem;
  font-weight: 800;
  color: rgba(0, 87, 183, 1);
  border-radius: 5px;
  padding: 10px;
  border: 1px solid rgba(0, 87, 183, 1);
`;
