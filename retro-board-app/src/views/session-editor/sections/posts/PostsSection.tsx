import React, { useCallback } from 'react';
import { SessionOptions } from '@retrospected/common';
import SettingCategory from '../SettingCategory';
import OptionItem from '../OptionItem';
import useTranslations from '../../../../translations';
import BooleanOption from '../BooleanOption';

interface PostsSectionProps {
  options: SessionOptions;
  onChange: (options: SessionOptions) => void;
}

function PostsSection({ options, onChange }: PostsSectionProps) {
  const translations = useTranslations();
  const { Customize } = translations;

  const setAllowAction = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowActions: value,
      });
    },
    [onChange, options]
  );

  const setAllowAuthorVisible = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowAuthorVisible: value,
      });
    },
    [onChange, options]
  );

  const setAllowReordering = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowReordering: value,
      });
    },
    [onChange, options]
  );

  const setAllowGrouping = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowGrouping: value,
      });
    },
    [onChange, options]
  );

  const setAllowGiphy = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowGiphy: value,
      });
    },
    [onChange, options]
  );

  const setBlurCards = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        blurCards: value,
      });
    },
    [onChange, options]
  );

  return (
    <SettingCategory
      title={Customize.postCategory!}
      subtitle={Customize.postCategorySub!}
    >
      <OptionItem label={Customize.blurCards!} help={Customize.blurCardsHelp!}>
        <BooleanOption value={options.blurCards} onChange={setBlurCards} />
      </OptionItem>
      <OptionItem
        label={Customize.allowActions!}
        help={Customize.allowActionsHelp!}
      >
        <BooleanOption value={options.allowActions} onChange={setAllowAction} />
      </OptionItem>
      <OptionItem
        label={Customize.allowAuthorVisible!}
        help={Customize.allowAuthorVisibleHelp!}
      >
        <BooleanOption
          value={options.allowAuthorVisible}
          onChange={setAllowAuthorVisible}
        />
      </OptionItem>
      <OptionItem
        label={Customize.allowReordering!}
        help={Customize.allowReorderingHelp!}
      >
        <BooleanOption
          value={options.allowReordering}
          onChange={setAllowReordering}
        />
      </OptionItem>
      <OptionItem
        label={Customize.allowGrouping!}
        help={Customize.allowGroupingHelp!}
      >
        <BooleanOption
          value={options.allowGrouping}
          onChange={setAllowGrouping}
        />
      </OptionItem>
      <OptionItem
        label={Customize.allowGiphy!}
        help={Customize.allowGiphyHelp!}
      >
        <BooleanOption value={options.allowGiphy} onChange={setAllowGiphy} />
      </OptionItem>
    </SettingCategory>
  );
}

export default PostsSection;
