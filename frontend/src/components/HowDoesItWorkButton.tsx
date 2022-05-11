import { colors } from '@mui/material';
import { Info } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';

interface HowDoesItWorkButtonProps {
  children: React.ReactElement;
  url: string;
}

export default function HowDoesItWorkButton({
  children,
  url,
}: HowDoesItWorkButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Container>
      {children}

      <LinkContainer>
        <Info />
        <GoLink onClick={() => navigate(url)}>
          {t('Home.howDoesThatWork')}
        </GoLink>
      </LinkContainer>
    </Container>
  );
}

const Container = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
`;

const LinkContainer = styled.div`
  font-size: 0.5em;
  margin-top: 3px;
  > svg {
    font-size: 1.3em;
    color: ${colors.lightBlue[100]};
    margin-right: 3px;
    position: relative;
    top: 1px;
  }
`;

const GoLink = styled.span`
  color: ${colors.lightBlue[100]};
  cursor: pointer;

  :hover {
    text-decoration: underline;
    color: ${colors.lightBlue[500]};
  }
`;
