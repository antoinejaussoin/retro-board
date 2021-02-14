import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Avatar from '../../components/Avatar';

import useTranslations from '../../translations';
import useGlobalState from '../../state';
import { colors } from '@material-ui/core';

function ParticipantsList() {
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
              <Avatar user={player} online={player.online} />
            </ListItemAvatar>
            <ListItemText
              primary={player.name}
              style={{
                color: player.online ? colors.grey[900] : colors.grey[500],
              }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default ParticipantsList;
