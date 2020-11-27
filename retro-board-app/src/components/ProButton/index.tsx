import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

  const goToSubscribe = useCallback(() => {
    history.push('/subscribe');
  }, [history]);

  if (isPro) {
    return <>{clone}</>;
  }

  return (
    <Container>
      <ProPill onClick={open}>
        {/* <Star htmlColor={colors.yellow[500]} fontSize="small" /> */}
        <span>Pro</span>
        <InfoOutlined htmlColor={colors.pink[300]} fontSize="small" />
      </ProPill>
      {clone}
      <Dialog
        onClose={close}
        maxWidth="sm"
        aria-labelledby="lock-session-dialog"
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
              icon={<EncryptionIcon style={{ fill: colors.red[700] }} />}
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

const Features = styled.div`
  > * {
    margin-bottom: 10px;
  }
`;

export default ProButton;
