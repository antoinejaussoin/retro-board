import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import shortid from 'shortid';
import { useHistory } from 'react-router-dom';
import {
  Fab,
  Card,
  CardMedia,
  Typography,
  CardContent,
  CardActions,
  makeStyles,
  colors,
  Button,
} from '@material-ui/core';
import { ThumbUpAlt, Settings } from '@material-ui/icons';
import useTranslations from '../translations';
import PreviousGames from './home/PreviousGames';
import CreateSessionModal from './home/CreateSession';
import logo from './home/logo.png';
import { SessionOptions, ColumnDefinition } from 'retro-board-common';
import { trackEvent } from './../track';
import { createCustomGame } from '../api';

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
  const translations = useTranslations();
  const createSession = useCallback(
    async (options: SessionOptions, columns: ColumnDefinition[]) => {
      const id = await createCustomGame(options, columns);
      if (id) {
        trackEvent('custom-modal/create');
        history.push(`/game/${id}`);
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
  const createDefaultSession = useCallback(() => {
    trackEvent('home/create/default');
    history.push('/game/' + shortid());
  }, [history]);
  return (
    <>
      <MainCard>
        <CardMedia
          className={classes.media}
          image={logo}
          component="img"
          title="Retrospected"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {translations.Join.welcome}
          </Typography>
          <Typography component="p">
            {translations.Join.standardTab.text}
          </Typography>
        </CardContent>
        <CardActions className={classes.actions}>
          <LaunchButtons>
            <Fab
              variant="extended"
              onClick={createDefaultSession}
              size="large"
              color="secondary"
            >
              <ThumbUpAlt className={classes.buttonIcon} />
              {translations.Join.standardTab.button}
            </Fab>
            <Button onClick={onOpenModal} color="primary">
              <Settings className={classes.buttonIcon} />
              {translations.Join.standardTab.customizeButton}
            </Button>
          </LaunchButtons>
          <CreateSessionModal
            open={modalOpen}
            onClose={onCloseModal}
            onLaunch={createSession}
          />
        </CardActions>
      </MainCard>
      <MainCard>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {translations.Join.previousTab.header}
          </Typography>
          <PreviousGames />
        </CardContent>
      </MainCard>
    </>
  );
}

const MainCard = styled(Card)`
  max-width: 800px;
  margin: auto;
  margin-bottom: 20px;
`;

const LaunchButtons = styled.div`
  display: flex;
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
