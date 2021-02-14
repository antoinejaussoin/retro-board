import styled from 'styled-components';
import { Alert } from '@material-ui/lab';

interface SettingCategoryProps {
  title: string;
  subtitle: string;
}

const SettingCategory: React.FC<SettingCategoryProps> = ({
  subtitle,
  children,
}) => {
  return (
    <Container>
      <Alert severity="success" style={{ marginTop: 10 }}>
        {subtitle}
      </Alert>
      <ChildrenContainer>{children}</ChildrenContainer>
    </Container>
  );
};

const ChildrenContainer = styled.div`
  width: 100%;
`;

const Container = styled.div``;

export default SettingCategory;
