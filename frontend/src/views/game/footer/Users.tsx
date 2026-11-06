import { CircleCheck } from 'lucide-react';
import CustomAvatar from 'components/Avatar';
import useParticipants from '../useParticipants';
import useSession from '../useSession';

export default function Users() {
  const { participants } = useParticipants();
  const { session } = useSession();

  return (
    <div className="flex items-center gap-1">
      {participants
        .filter((u) => u.online)
        .map((user) => {
          return (
            <span key={user.id} className="relative inline-flex shrink-0">
              <CustomAvatar user={user} className="size-8" />
              {session?.ready.includes(user.id) ? (
                <CircleCheck className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full bg-cream text-emerald-500" />
              ) : null}
            </span>
          );
        })}
    </div>
  );
}
