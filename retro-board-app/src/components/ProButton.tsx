import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { InfoOutlined, Star } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import useUser from '../auth/useUser';
import useModal from '../hooks/useModal';

interface ComponentProp {
  disabled?: boolean;
}

interface ProButtonProps {
  children: React.ReactElement<ComponentProp>;
}

function ProButton({ children }: ProButtonProps) {
  const user = useUser();
  const isPro = user && user.pro;
  const [opened, open, close] = useModal();
  const clone = React.cloneElement(children, { disabled: !isPro });
  const history = useHistory();

  const goToSubscribe = useCallback(() => {
    history.push('/subscribe');
  }, [history]);

  if (isPro) {
    return <>{clone}</>;
  }

  return (
    <Container>
      <ProPill onClick={open}>
        <Star htmlColor={colors.yellow[500]} fontSize="small" />
        <span>Pro</span>
        <InfoOutlined htmlColor={colors.pink[300]} fontSize="small" />
      </ProPill>
      {clone}
      <Dialog
        onClose={close}
        maxWidth="xl"
        aria-labelledby="lock-session-dialog"
        open={opened}
      >
        <DialogTitle id="lock-session-dialog">Pro Subscription</DialogTitle>
        <DialogContent style={{ padding: 0, margin: 0 }}>
          <Header>Subscribe to Pro</Header>
        </DialogContent>
        <DialogContent>
          <DialogContentText>
            Protect your company's data by subscribing to Retrospected Pro.
            <br />
            For as low as $9.99, get the following Pro features and more:
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <ul>
            <li>Encrypted Sessions</li>
            <li>Session Locking</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={goToSubscribe}>
            Find out more
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const ProPill = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  top: -14px;
  right: -5px;
  background-color: ${colors.deepPurple[300]};
  padding: 2px 5px;
  border-radius: 3px;
  color: white;
  font-size: 12px;

  span {
    padding: 0 5px;
  }

  cursor: pointer;
`;

const Header = styled.div`
  background-color: ${colors.deepPurple[300]};
  color: white;
  min-width: 60hw;
  padding: 50px 100px;
  font-size: 3em;
  font-weight: 100;
`;

export default ProButton;
