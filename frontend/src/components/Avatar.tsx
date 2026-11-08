import type { User } from 'common';
import md5 from 'md5';
import { cn } from 'ui/cn';

interface AvatarProps {
  user: User | null;
  online?: boolean;
  className?: string;
}

const getGravatar = (user: User | null) => {
  if (user?.photo) {
    return user.photo;
  }
  if (user) {
    return `https://www.gravatar.com/avatar/${md5(user.id)}?d=retro`;
  }
  return undefined;
};

const CustomAvatar = ({ user, online, className }: AvatarProps) => {
  const displayName = user ? user.name : 'Not logged in';
  const avatar = (
    <img
      alt={displayName}
      src={getGravatar(user)}
      referrerPolicy="no-referrer"
      title={displayName}
      className={cn(
        'size-9 rounded-full bg-primary-100 object-cover',
        className,
      )}
    />
  );

  if (!online) {
    return avatar;
  }

  return (
    <span className="relative inline-flex">
      {avatar}
      <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-cream" />
    </span>
  );
};

export default CustomAvatar;
