import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import { Alert } from '@mui/material';
import { colors } from '@mui/material';

type OptionItemProps = {
  children: JSX.Element;
  help: string;
  label: string;
  wide?: boolean;
};

export function OptionItem({
  label,
  help,
  children,
  wide = false,
}: OptionItemProps) {
  return (
    <Container>
      <HeaderContainer wide={wide}>
        <Label wide={wide}>
          <Typography component="div" style={{ fontWeight: 300 }}>
            {label}
          </Typography>
        </Label>
        <ComponentContainer wide={wide}>{children}</ComponentContainer>
      </HeaderContainer>
      <Alert
        severity="info"
        style={{
          margin: '0px -15px 0px -15px',
          borderRadius: '0px 0px 10px 10px',
        }}
      >
        {help}
      </Alert>
    </Container>
  );
}

const Container = styled.div`
  border: 1px solid ${colors.grey[200]};
  background-color: ${colors.grey[50]};
  padding: 0px 15px;
  margin: 15px 0;
  border-radius: 10px;
`;

const ComponentContainer = styled.div<{ wide: boolean }>`
  flex: ${(props) => (props.wide ? '1' : 'unset')};
  ${(props) => (props.wide ? 'width: 100%;' : '')}
`;

const Label = styled.div<{ wide: boolean }>`
  font-weight: lighter;
  flex: ${(props) => (props.wide ? 'unset' : '1')};
  margin-right: 20px;
  min-height: 30px;
  display: flex;
  align-items: center;
  @media screen and (max-width: 600px) {
    margin-top: ${(props) => (props.wide ? '10px' : '0')};
  }
`;

const HeaderContainer = styled.div<{ wide: boolean }>`
  display: flex;
  align-items: center;
  min-height: 50px;
  @media screen and (max-width: 600px) {
    ${(props) =>
      props.wide
        ? `
    flex-direction: column;
    align-items: flex-start;
    `
        : ''}
  }
`;
