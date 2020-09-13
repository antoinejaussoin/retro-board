import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Fab, makeStyles, colors, Button } from '@material-ui/core';
import { ThumbUpAlt, Settings } from '@material-ui/icons';
import useTranslations from '../translations';
import PreviousGames from './home/PreviousGames';
import CreateSessionModal from './home/CreateSession';
import { SessionOptions, ColumnDefinition } from 'retro-board-common';
import { trackEvent } from './../track';
import { createGame, createCustomGame } from '../api';
import { Page } from '../components/Page';
import usePreviousSessions from '../hooks/usePreviousSessions';
import useUser from '../auth/useUser';

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
  const history = useHistory();
  const user = useUser();
  const isLoggedIn = !!user;
  const translations = useTranslations();
  const previousSessions = usePreviousSessions();
  const hasPreviousSessions = previousSessions.length > 0;
  const createSession = useCallback(
    async (
      options: SessionOptions,
      columns: ColumnDefinition[],
      defaultTemplate: boolean
    ) => {
      const session = await createCustomGame(defaultTemplate, options, columns);
      if (session) {
        trackEvent('custom-modal/create');
        history.push(`/game/${session.id}`);
      } else {
        trackEvent('custom-modal/fail');
      }
    },
    [history]
  );
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const onCloseModal = useCallback(() => {
    setModalOpen(false);
    trackEvent('custom-modal/close');
  }, []);
  const onOpenModal = useCallback(() => {
    setModalOpen(true);
    trackEvent('custom-modal/open');
  }, []);
  const createDefaultSession = useCallback(async () => {
    const session = await createGame();
    trackEvent('home/create/default');
    history.push('/game/' + session.id);
  }, [history]);

  return (
    <Page>
      <MainHeader>{translations.Home.welcome!(user?.name || '')}</MainHeader>

      <LaunchButtons>
        <Fab
          variant="extended"
          onClick={createDefaultSession}
          size="large"
          color="secondary"
          disabled={!isLoggedIn}
        >
          <ThumbUpAlt className={classes.buttonIcon} />
          {translations.Join.standardTab.button}
        </Fab>
        <Button onClick={onOpenModal} color="primary" disabled={!isLoggedIn}>
          <Settings className={classes.buttonIcon} />
          {translations.Join.standardTab.customizeButton}
        </Button>
      </LaunchButtons>

      <CreateSessionModal
        open={modalOpen}
        onClose={onCloseModal}
        onLaunch={createSession}
      />

      {hasPreviousSessions ? (
        <>
          <SubHeader>{translations.Join.previousTab.header}</SubHeader>
          <PreviousGames games={previousSessions} />
        </>
      ) : null}
    </Page>
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
    > button {
      margin: 0;
    }
    > button:last-child {
      margin-top: 20px;
    }
  }
`;

export default Home;
