import styled from '@emotion/styled';
import { Alert } from '@mui/material';
import { PropsWithChildren } from 'react';

interface SettingCategoryProps {
  title: string;
  subtitle: string;
}

export default function SettingCategory({
  subtitle,
  children,
}: PropsWithChildren<SettingCategoryProps>) {
  return (
    <Container>
      <Alert severity="success" style={{ marginTop: 10 }}>
        {subtitle}
      </Alert>
      <ChildrenContainer>{children}</ChildrenContainer>
    </Container>
  );
}

const ChildrenContainer = styled.div`
  width: 100%;
`;

const Container = styled.div``;
