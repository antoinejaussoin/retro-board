import React, { useCallback } from 'react';
import styled from 'styled-components';
import shortid from 'shortid';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  Button,
  Card,
  CardMedia,
  Typography,
  CardContent,
  CardActions,
  makeStyles,
} from '@material-ui/core';
import useTranslations from '../translations';
import PreviousGames from './home/PreviousGames';
import logo from './home/logo.png';

interface HomeProps extends RouteComponentProps {}

const useStyles = makeStyles({
  media: {
    objectFit: 'cover',
  },
  actions: {
    justifyContent: 'center',
    margin: 20,
  },
});

function Home(props: HomeProps) {
  const translations = useTranslations();
  const createSession = useCallback(() => {
    props.history.push('/game/' + shortid());
  }, [props.history]);
  const classes = useStyles();
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
          <Button
            onClick={createSession}
            variant="contained"
            size="large"
            color="secondary"
          >
            {translations.Join.standardTab.button}
          </Button>
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
export default withRouter(Home);
