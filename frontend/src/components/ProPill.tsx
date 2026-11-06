import { Star } from 'lucide-react';
import useIsPro from '../auth/useIsPro';
import useIsTrial from '../auth/useIsTrial';
import useUser from '../state/user/useUser';
import { Chip } from 'ui/chip';

interface ProPillProps {
  small?: boolean;
}

function ProPill({ small = false }: ProPillProps) {
  const isPro = useIsPro();
  const isTrial = useIsTrial();
  const user = useUser();
  if (!user) {
    return null;
  }
  if (!isPro) {
    return (
      <Chip tone="muted" className={small ? 'px-2 py-0 text-[10px]' : undefined}>
        Free
      </Chip>
    );
  }
  return (
    <Chip
      tone="secondary"
      className={small ? 'px-2 py-0 text-[10px]' : undefined}
      icon={<Star className="size-3 fill-amber-300 text-amber-300" />}
    >
      {isTrial ? 'Pro Trial' : 'Pro'}
    </Chip>
  );
}

export default ProPill;
