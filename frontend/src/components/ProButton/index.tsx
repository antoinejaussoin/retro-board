import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { colors } from '@mui/material';
import {
  AllInclusive,
  Lock,
  Psychology,
  VerifiedUser,
} from '@mui/icons-material';
import { useCallback, cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import useIsPro from '../../auth/useIsPro';
import useIsDisabled from '../../hooks/useIsDisabled';
import useModal from '../../hooks/useModal';
import { startTrial } from '../../views/subscribe/api';
import Feature from './Feature';
import { trackEvent } from '../../track';
import { useTranslation } from 'react-i18next';

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');

  const goToSubscribe = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/modal/subscribe');
      navigate('/subscribe');
      close();
    },
    [navigate, close]
  );

  const handleStartTrial = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/start');
      await startTrial();
      window.location.reload();
    },
    []
  );

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/modal/cancel');
      close();
    },
    [close]
  );

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/modal/open');
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
        <DialogTitle id="lock-session-dialog">
          {t('SubscribeModal.title')}
        </DialogTitle>
        <DialogContent style={{ padding: 0, margin: 0 }}>
          <Header>{t('SubscribeModal.header')}</Header>
        </DialogContent>
        <DialogContent>
          <DialogContentText>
            {t('SubscribeModal.description')}
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <Features>
            <Feature
              icon={<Lock />}
              color={colors.red[700]}
              title={t('SubscribeModal.features.encryptedSession.title')!}
              description={
                t('SubscribeModal.features.encryptedSession.description')!
              }
            />
            <Feature
              icon={<VerifiedUser />}
              color={colors.green[700]}
              title={t('SubscribeModal.features.privateSessions.title')!}
              description={
                t('SubscribeModal.features.privateSessions.description')!
              }
            />
            <Feature
              icon={<AllInclusive />}
              color={colors.orange[700]}
              title={t('SubscribeModal.features.unlimitedPosts.title')!}
              description={
                t('SubscribeModal.features.unlimitedPosts.description')!
              }
            />
            <Feature
              icon={<Psychology />}
              color={colors.blue[700]}
              title={t('SubscribeModal.features.ai.title')!}
              description={t('SubscribeModal.features.ai.description')!}
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
              {t('SubscribeModal.startTrial')}
            </Button>
          </LeftButtons>
          <Button onClick={handleClose}>
            {t('SubscribeModal.cancelButton')}
          </Button>
          <Button variant="contained" color="primary" onClick={goToSubscribe}>
            {t('SubscribeModal.subscribeButton')}
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
  background-color: var(--rs-accent);
  background: linear-gradient(
    171deg,
    var(--rs-accent) 35%,
    var(--rs-accent-dark) 100%
  );
  color: var(--rs-accent-contrast);
  min-width: 60hw;
  padding: 20px 20px;
  font-size: 2.5em;
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
