import styled from '@emotion/styled';
import CardActions from '@mui/material/CardActions';

interface ActionsBarProps {
  rightActions: React.ReactNode;
}

const ActionsBar = ({
  children,
  rightActions,
}: React.PropsWithChildren<ActionsBarProps>) => {
  return (
    <Actions>
      <ButtonsContainer>
        <MainButtons>{children}</MainButtons>
        <RightActions>{rightActions}</RightActions>
      </ButtonsContainer>
    </Actions>
  );
};

const Actions = styled(CardActions)`
  position: relative;
  flex: 1;
  padding: 0 !important;

  > div {
    flex: 1;
    margin: 0;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  margin: 0;
  padding: 4px 8px;
  border-top: 1px solid var(--rs-border);
  background: #fafaf9;
`;

const RightActions = styled.div``;

const MainButtons = styled.div`
  flex: 1;
`;

export default ActionsBar;
