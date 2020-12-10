import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import useUser from '../../auth/useUser';
import useModal from '../../hooks/useModal';
import EncryptionIcon from '../../icons/EncryptionIcon';
import useTranslation from '../../translations/useTranslations';
import Arrow from './Arrow';
import Feature from './Feature';

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
  const { SubscribeModal: translations } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');

  const goToSubscribe = useCallback(() => {
    history.push('/subscribe');
  }, [history]);

  if (isPro) {
    return <>{clone}</>;
  }

  return (
    <Container>
      <ProPill onClick={open}>
        <span>Pro feature</span>
        <Arrow />
      </ProPill>
      {clone}
      <Dialog
        onClose={close}
        maxWidth="sm"
        aria-labelledby="lock-session-dialog"
        fullScreen={fullScreen}
        open={opened}
      >
        <DialogTitle id="lock-session-dialog">{translations.title}</DialogTitle>
        <DialogContent style={{ padding: 0, margin: 0 }}>
          <Header>{translations.header}</Header>
        </DialogContent>
        <DialogContent>
          <DialogContentText>{translations.description}</DialogContentText>
        </DialogContent>
        <DialogContent>
          <Features>
            <Feature
              icon={<EncryptionIcon />}
              color={colors.red[700]}
              title={translations.features.encryptedSession.title!}
              description={translations.features.encryptedSession.description!}
            />
            <Feature
              icon={<Lock />}
              color={colors.green[700]}
              title={translations.features.sessionLocking.title!}
              description={translations.features.sessionLocking.description!}
            />
          </Features>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>{translations.cancelButton}</Button>
          <Button variant="contained" color="primary" onClick={goToSubscribe}>
            {translations.subscribeButton}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  > * {
    flex: 1;
  }
`;

const ProPill = styled.div`
  font-family: 'Reenie Beanie', cursive;

  display: flex;
  align-items: center;
  position: absolute;
  top: -27px;
  right: 20px;
  padding: 2px 10px;
  border-radius: 3px;
  color: ${colors.pink[300]};
  z-index: 1;
  font-size: 25px;
  white-space: nowrap;

  :hover {
    color: ${colors.pink[700]};
    svg {
      color: ${colors.pink[700]};
    }
  }

  svg {
    fill: ${colors.pink[300]};
    position: relative;
    top: 10px;
    left: 10px;
  }

  span {
  }

  cursor: pointer;
`;

const Header = styled.div`
  background-color: ${colors.deepPurple[300]};
  color: white;
  min-width: 60hw;
  padding: 50px 20px;
  font-size: 3em;
  font-weight: 100;
  display: flex;
  justify-content: center;

  @media screen and (max-width: 600px) {
    font-size: 1.5rem;
    padding: 10px;
  }

  @media screen and (max-width: 400px) {
    display: none;
  }

  @media screen and (max-height: 700px) {
    display: none;
  }
`;

const Features = styled.div`
  > * {
    margin-bottom: 10px;
  }
`;

export default ProButton;
