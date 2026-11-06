import { useMemo } from 'react';
import type { User } from 'common';
import CustomAvatar from 'components/Avatar';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

type UserSelectorProps = {
  moderatorId: string;
  options: User[];
  onSelect: (user: User) => void;
};

export function UserSelector({
  moderatorId,
  options,
  onSelect,
}: UserSelectorProps) {
  const { t } = useTranslation();
  const selected: User | null = useMemo(() => {
    return options.find((user) => user.id === moderatorId) || null;
  }, [options, moderatorId]);

  return (
    <div className="w-full py-1 sm:ml-auto sm:max-w-xs">
      <Select
        value={selected?.id}
        disabled={options.length === 0}
        onValueChange={(id) => {
          const user = options.find((option) => option.id === id);
          if (user) {
            onSelect(user);
          }
        }}
      >
        <SelectTrigger aria-label={t('Customize.changeModerator')}>
          <SelectValue placeholder={selected?.name ?? ''}>
            {selected?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[70]">
          {options.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <UserItem user={user} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type UserItemProps = {
  user: User;
};

export function UserItem({ user }: UserItemProps) {
  return (
    <span className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-2 text-left text-sm">
      <span className="row-span-2">
        <CustomAvatar user={user} className="size-8" />
      </span>
      <span className="truncate">{user.name}</span>
      <span className="truncate text-xs text-muted">{user.email}</span>
    </span>
  );
}
