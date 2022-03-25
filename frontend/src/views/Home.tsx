import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import { makeStyles } from '@mui/styles';
import { colors } from '@mui/material';
import { Lock, ThumbUpAlt } from '@mui/icons-material';
import useTranslations from '../translations';
import PreviousGames from './home/PreviousGames';
import { SessionMetadata } from 'common';
import { trackEvent } from './../track';
import { createGame, createEncryptedGame, deleteSession } from '../api';
import { Page } from '../components/Page';
import usePreviousSessions from '../hooks/usePreviousSessions';
import useUser from '../auth/useUser';
import shortid from 'shortid';
import { storeEncryptionKeyLocally } from '../crypto/crypto';
import ProButton from '../components/ProButton';
import { useSnackbar } from 'notistack';
import TrialPrompt from './home/TrialPrompt';
import HowDoesItWorkButton from '../components/HowDoesItWorkButton';

const useStyles = makeStyles({
  media: {
    objectFit: 'cover',
    backgroundColor: colors.grey[200],
  },
  actions: {
    justifyContent: 'center',
    margin: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
});

function Home() {
  const navigate = useNavigate();
  const user = useUser();
  const isLoggedIn = !!user;
  const translations = useTranslations();
  const { enqueueSnackbar } = useSnackbar();
  const [previousSessions, refreshPreviousSessions] = usePreviousSessions();
  const hasPreviousSessions = previousSessions.length > 0;
  const classes = useStyles();

  const createDefaultSession = useCallback(async () => {
    const session = await createGame();
    if (session) {
      trackEvent('home/create/default');
      navigate('/game/' + session.id);
    } else {
      enqueueSnackbar('Something went wrong when creating the session', {
        variant: 'error',
      });
    }
  }, [navigate, enqueueSnackbar]);

  const createEncryptedSession = useCallback(async () => {
    const key = shortid();
    const session = await createEncryptedGame(key);
    if (session) {
      storeEncryptionKeyLocally(session.id, key);
      trackEvent('home/create/encrypted');
      navigate(`/game/${session.id}#${key}`);
    } else {
      enqueueSnackbar(
        'Something went wrong when creating the encrypted session',
        { variant: 'error' }
      );
    }
  }, [navigate, enqueueSnackbar]);

  const handleDeleteSession = useCallback(
    async (session: SessionMetadata) => {
      await deleteSession(session.id);
      await refreshPreviousSessions();
    },
    [refreshPreviousSessions]
  );

  return (
    <>
      <TrialPrompt />
      <Page>
        <MainHeader>{translations.Home.welcome!(user?.name || '')}</MainHeader>

        <LaunchButtons>
          <ProButton quota>
            <Fab
              variant="extended"
              onClick={createDefaultSession}
              size="large"
              color="secondary"
              disabled={!isLoggedIn}
              data-cy="new-session-button"
            >
              <ThumbUpAlt className={classes.buttonIcon} />
              {translations.Join.standardTab.button}
            </Fab>
          </ProButton>
          <div style={{ width: 30 }} />
          <HowDoesItWorkButton url="/how-does-encryption-work">
            <ProButton>
              <Fab
                variant="extended"
                onClick={createEncryptedSession}
                size="large"
                color="secondary"
                disabled={!isLoggedIn}
              >
                <Lock className={classes.buttonIcon} />
                {translations.Encryption.createEncryptedSession}
              </Fab>
            </ProButton>
          </HowDoesItWorkButton>
        </LaunchButtons>

        {hasPreviousSessions ? (
          <>
            <SubHeader>{translations.Join.previousTab.header}</SubHeader>
            <PreviousGames
              games={previousSessions}
              onDelete={handleDeleteSession}
            />
          </>
        ) : null}
      </Page>
    </>
  );
}

const MainHeader = styled.h1`
  font-weight: 100;
  font-size: 4em;
  @media screen and (max-width: 500px) {
    font-size: 2em;
  }
`;

const SubHeader = styled.h2`
  font-weight: 100;
  font-size: 3em;
  @media screen and (max-width: 500px) {
    font-size: 1.5em;
  }
`;

const LaunchButtons = styled.div`
  display: flex;
  margin: 30px 30px 60px;
  > button {
    margin: 0 10px;
  }

  @media (max-width: 500px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    > button {
      margin: 0;
    }
    > *:last-child {
      margin-top: 40px;
    }
  }
`;

export default Home;
