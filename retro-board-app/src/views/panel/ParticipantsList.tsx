import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Avatar from '../../components/Avatar';
import useTranslations from '../../translations';
import grey from '@material-ui/core/colors/grey';
import useParticipants from '../game/useParticipants';

function ParticipantsList() {
  const translations = useTranslations();
  const { participants } = useParticipants();

  return (
    <>
      <List
        component="section"
        subheader={<ListSubheader>{translations.Clients.header}</ListSubheader>}
      >
        {participants.map((player, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar user={player} online={player.online} />
            </ListItemAvatar>
            <ListItemText
              primary={player.name}
              style={{
                color: player.online ? grey[900] : grey[500],
              }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default ParticipantsList;
