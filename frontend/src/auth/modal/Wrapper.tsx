import styled from '@emotion/styled';

interface WrapperProps {
  header?: string;
  actions?: JSX.Element;
}

const Wrapper: React.FC<WrapperProps> = ({ header, actions, children }) => {
  return (
    <Container>
      <Title>{header}</Title>
      <Content>{children}</Content>
      <Actions>{actions}</Actions>
    </Container>
  );
};

const Container = styled.div``;
const Title = styled.div`
  font-weight: 100;
  font-size: 1.6em;
  margin: 20px 0;
`;
const Content = styled.div``;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 20px 0 5px 0;
`;

export default Wrapper;
