import React from 'react';
import md5 from 'md5';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import useTranslations from '../../translations';
import useGlobalState from '../../state';

const getGravatar = (client: string) =>
  `https://www.gravatar.com/avatar/${md5(client)}?d=retro`;

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
              <Avatar alt={player.name} src={getGravatar(player.id)} />
            </ListItemAvatar>
            <ListItemText primary={player.name} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default PlayerList;
