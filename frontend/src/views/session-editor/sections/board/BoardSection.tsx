import { useCallback, useEffect, useState } from 'react';
import type { AllSessionSettings, User } from 'common';
import CustomAvatar from 'components/Avatar';
import { useTranslation } from 'react-i18next';
import BooleanOption from '../BooleanOption';
import { OptionItem } from '../OptionItem';
import SettingCategory from '../SettingCategory';
import { fetchUsers } from './api';
import { UserSelector } from './UserSelector';

interface BoardSectionProps {
  owner: User;
  options: AllSessionSettings;
  onChange: (options: AllSessionSettings) => void;
}

function BoardSection({ options, owner, onChange }: BoardSectionProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function load() {
      const nextUsers = await fetchUsers();
      setUsers(Array.isArray(nextUsers) ? nextUsers : []);
    }
    load();
  }, []);

  const setRestrictTitleEditToOwner = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        options: {
          ...options.options,
          restrictTitleEditToModerator: value,
        },
      });
    },
    [onChange, options],
  );

  const setModerator = useCallback(
    (user: User) => {
      onChange({
        ...options,
        moderator: user,
      });
    },
    [onChange, options],
  );

  return (
    <SettingCategory
      title={t('Customize.boardCategory')}
      subtitle={t('Customize.boardCategorySub')}
    >
      <OptionItem label={t('Customize.owner')} help={t('Customize.ownerHelp')}>
        <div className="flex items-center gap-2.5">
          <span>{owner.name}</span>
          <CustomAvatar user={owner} className="size-8" />
        </div>
      </OptionItem>
      <OptionItem
        label={t('Customize.changeModerator')}
        help={t('Customize.changeModeratorHelp')}
        wide
      >
        <UserSelector
          onSelect={setModerator}
          options={users}
          moderatorId={options.moderator.id}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.restrictTitleEditToOwner')}
        help={t('Customize.restrictTitleEditToOwnerHelp')}
      >
        <BooleanOption
          value={options.options.restrictTitleEditToModerator}
          onChange={setRestrictTitleEditToOwner}
        />
      </OptionItem>
    </SettingCategory>
  );
}

export default BoardSection;
