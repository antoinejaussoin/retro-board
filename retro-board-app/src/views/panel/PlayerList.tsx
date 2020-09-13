import React from 'react';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Avatar from '../../components/Avatar';

import useTranslations from '../../translations';
import useGlobalState from '../../state';

function PlayerList() {
  const translations = useTranslations();
  const { state } = useGlobalState();

  return (
    <>
      <List
        component="section"
        subheader={<ListSubheader>{translations.Clients.header}</ListSubheader>}
      >
        {state.players.map((player, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar user={player} />
            </ListItemAvatar>
            <ListItemText primary={player.name} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default PlayerList;
