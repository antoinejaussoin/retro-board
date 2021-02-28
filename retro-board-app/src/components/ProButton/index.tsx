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
import { AllInclusive, Lock, VerifiedUser } from '@material-ui/icons';
import { useCallback, cloneElement } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import useIsPro from '../../auth/useIsPro';
import useIsDisabled from '../../hooks/useIsDisabled';
import useModal from '../../hooks/useModal';
import useTranslation from '../../translations/useTranslations';
import { startTrial } from '../../views/subscribe/api';
import Feature from './Feature';

interface ComponentProp {
  disabled?: boolean;
  onClick?: () => void;
}

interface ProButtonProps {
  children: React.ReactElement<ComponentProp>;
  /**
   * Will only show the modal if the quota is reached
   */
  quota?: boolean;
}

function ProButton({ children, quota }: ProButtonProps) {
  const isPro = useIsPro();
  const isDisabled = useIsDisabled();
  const isValid = isPro || (quota && !isDisabled);
  const [opened, open, close] = useModal();
  const clone = isValid ? children : cloneElement(children, { onClick: open });
  const history = useHistory();
  const { SubscribeModal: translations } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');

  const goToSubscribe = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      history.push('/subscribe');
    },
    [history]
  );

  const handleStartTrial = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      await startTrial();
      window.location.reload();
    },
    []
  );

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      close();
    },
    [close]
  );

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();

      open();
    },
    [open]
  );

  if (isValid) {
    return <>{clone}</>;
  }

  return (
    <Container onClick={handleOpen}>
      {clone}
      <Dialog
        onClose={handleClose}
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
              icon={<Lock />}
              color={colors.red[700]}
              title={translations.features.encryptedSession.title!}
              description={translations.features.encryptedSession.description!}
            />
            <Feature
              icon={<VerifiedUser />}
              color={colors.green[700]}
              title={translations.features.privateSessions.title!}
              description={translations.features.privateSessions.description!}
            />
            <Feature
              icon={<AllInclusive />}
              color={colors.orange[700]}
              title={translations.features.unlimitedPosts.title!}
              description={translations.features.unlimitedPosts.description!}
            />
          </Features>
        </DialogContent>
        <DialogActions>
          <LeftButtons>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStartTrial}
            >
              {translations.startTrial}
            </Button>
          </LeftButtons>
          <Button onClick={handleClose}>{translations.cancelButton}</Button>
          <Button variant="contained" color="primary" onClick={goToSubscribe}>
            {translations.subscribeButton}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

const LeftButtons = styled.div`
  display: flex;
  flex: 1;
`;

const Container = styled.span`
  cursor: pointer;
  display: inline-flex;
  > * {
    flex: 1;
  }
`;

const Header = styled.div`
  background-color: ${colors.deepPurple[300]};
  background: ${`linear-gradient(
    171deg,
    ${colors.deepPurple[300]} 35%,
    ${colors.deepPurple[600]} 100%
  )`};
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
