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
import { InfoOutlined, Lock } from '@material-ui/icons';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import useUser from '../../auth/useUser';
import useModal from '../../hooks/useModal';
import EncryptionIcon from '../../icons/EncryptionIcon';
import useTranslation from '../../translations/useTranslations';
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
        <span>Pro</span>
        <InfoOutlined htmlColor={colors.pink[300]} fontSize="small" />
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
  display: flex;
  align-items: center;
  position: absolute;
  top: -14px;
  right: -5px;
  background-color: white;
  padding: 2px 5px;
  border-radius: 3px;
  color: ${colors.deepPurple[300]};
  border: 1px solid ${colors.deepPurple[300]};
  border-radius: 3px;
  z-index: 1;
  font-size: 12px;

  :hover {
    background-color: ${colors.deepPurple[300]};
    color: white;
  }

  span {
    padding: 0 5px;
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
`;

const Features = styled.div`
  > * {
    margin-bottom: 10px;
  }
`;

export default ProButton;
