import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';
import { Dashboard, Key } from '@mui/icons-material';
import PreviousGames from './home/PreviousGames';
import { SessionMetadata } from 'common';
import { trackAdWordsConversion, trackEvent } from './../track';
import { createGame, createEncryptedGame, deleteSession } from '../api';
import { Page } from '../components/Page';
import usePreviousSessions from '../hooks/usePreviousSessions';
import useUser from '../state/user/useUser';
import shortid from 'shortid';
import { storeEncryptionKeyLocally } from '../crypto/crypto';
import ProButton from '../components/ProButton';
import { useSnackbar } from 'notistack';
import TrialPrompt from './home/TrialPrompt';
import { useTranslation } from 'react-i18next';
import ClosableAlert from 'components/ClosableAlert';
import SplitButton from 'components/SplitButton/SplitButton';
import SearchBar from './game/SearchBar';
import { NameEditor } from 'molecules/NameEditor';
import { SetupProPrompt } from './home/SetupProPrompt';

function Home() {
  const navigate = useNavigate();
  const user = useUser();
  const isLoggedIn = !!user;
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [previousSessions, refreshPreviousSessions] = usePreviousSessions();
  const hasPreviousSessions = previousSessions.length > 0;

  const filteredSessions = useMemo(() => {
    if (!search) {
      return previousSessions;
    }
    return previousSessions.filter((session) =>
      (session.name || t('SessionName.defaultSessionName')!)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, previousSessions, t]);

  const createDefaultSession = useCallback(async () => {
    const session = await createGame();
    if (session) {
      trackEvent('home/create/default');
      trackAdWordsConversion();
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
      trackAdWordsConversion();
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
      <SetupProPrompt />
      {user && user.accountType === 'anonymous' ? (
        <ClosableAlert severity="info" closable>
          <span>{t('Home.anonWarning')}</span>&nbsp;&nbsp;&nbsp;
          <Link style={{ textDecoration: 'none' }} to="/account">
            {t('Home.login')}
          </Link>
        </ClosableAlert>
      ) : null}
      <Page>
        <MainHeader>
          {t('Home.welcome')}&nbsp;
          <NameEditor />
        </MainHeader>

        <LaunchButtons>
          <ProButton quota>
            <SplitButton
              data-cy="new-session-button"
              disabled={!isLoggedIn}
              icon={<Dashboard fontSize="large" />}
              onClick={createDefaultSession}
              label={t('Join.standardTab.button')!}
              secondary
              large
            >
              <MenuItem onClick={createDefaultSession}>
                <ListItemIcon>
                  <Dashboard fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('Join.standardTab.button')}</ListItemText>
              </MenuItem>
              <ProButton>
                <MenuItem onClick={createEncryptedSession}>
                  <ListItemIcon>
                    <Key fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {t('Encryption.createEncryptedSession')}
                  </ListItemText>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paddingLeft={5}
                  >
                    Pro
                  </Typography>
                </MenuItem>
              </ProButton>
            </SplitButton>
          </ProButton>
        </LaunchButtons>

        {hasPreviousSessions ? (
          <>
            <PreviousContainer>
              <SubHeader>{t('Join.previousTab.header')}</SubHeader>
              <SearchBar value={search} onChange={setSearch} />
            </PreviousContainer>

            <PreviousGames
              games={filteredSessions}
              onDelete={handleDeleteSession}
            />

            {!!search && filteredSessions.length === 0 ? (
              <Alert severity="info">
                {t('Home.searchNoMatch', { search })}
              </Alert>
            ) : null}
          </>
        ) : (
          <>
            <PreviousContainer>
              <SubHeader>{t('Home.discover')}</SubHeader>
            </PreviousContainer>
            <VideoContainer>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/SpbAaziAwTY"
                title="Discover Retrospected"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </VideoContainer>
          </>
        )}
      </Page>
    </>
  );
}

const MainHeader = styled.h1`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-weight: 100;
  font-size: 4em;
  @media screen and (max-width: 800px) {
    font-size: 2em;
  }
`;

const SubHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 30px;
  font-weight: 100;
  font-size: 3em;
  @media screen and (max-width: 500px) {
    font-size: 1.5em;
  }
`;

const PreviousContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
`;

const LaunchButtons = styled.div`
  display: flex;
  margin: 30px 0px 60px;
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

const VideoContainer = styled.div`
  display: flex;
  justify-content: center;
  > iframe {
    width: min(800px, 100%);
    aspect-ratio: 800/450;
    border: none;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
      rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
      rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  }
`;

export default Home;
