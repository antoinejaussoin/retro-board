import Avatar from '../../components/Avatar';
import useParticipants from '../game/useParticipants';
import { useTranslation } from 'react-i18next';

function ParticipantsList() {
  const { t } = useTranslation();
  const { participants } = useParticipants();

  return (
    <section className="px-4 py-3">
      <h2 className="px-1 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
        {t('Clients.header')}
      </h2>
      <ul className="flex flex-col">
        {participants.map((player) => (
          <li key={player.id} className="flex items-center gap-3 py-2">
            <Avatar user={player} online={player.online} />
            <span className={player.online ? 'text-ink' : 'text-muted'}>
              {player.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ParticipantsList;
