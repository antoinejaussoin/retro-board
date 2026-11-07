import { useCallback } from 'react';
import { SessionOptions } from 'common';
import SettingCategory from '../SettingCategory';
import { OptionItem } from '../OptionItem';
import { useTranslation } from 'react-i18next';
import BooleanOption from '../BooleanOption';
import MaxPostsSlider from './MaxPostsSlider';
import useBackendCapabilities from 'global/useBackendCapabilities';

interface PostsSectionProps {
  options: SessionOptions;
  onChange: (options: SessionOptions) => void;
}

function PostsSection({ options, onChange }: PostsSectionProps) {
  const { t } = useTranslation();
  const capabilities = useBackendCapabilities();

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

  const setNewPostsFirst = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        newPostsFirst: value,
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

  const setAllowReactions = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowReactions: value,
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

  const setMaxPosts = useCallback(
    (value: number | null) => {
      onChange({
        ...options,
        maxPosts: value,
      });
    },
    [onChange, options]
  );

  const setRestrictReorderingToOwner = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        restrictReorderingToModerator: value,
      });
    },
    [onChange, options]
  );

  const setRestrictGroupingToOwner = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        restrictGroupingToModerator: value,
      });
    },
    [onChange, options]
  );

  return (
    <SettingCategory
      title={t('Customize.postCategory')!}
      subtitle={t('Customize.postCategorySub')!}
    >
      <OptionItem
        label={t('Customize.maxPosts')!}
        help={t('Customize.maxPostsHelp')!}
        wide
      >
        <MaxPostsSlider value={options.maxPosts} onChange={setMaxPosts} />
      </OptionItem>
      <OptionItem
        label={t('Customize.blurCards')!}
        help={t('Customize.blurCardsHelp')!}
      >
        <BooleanOption value={options.blurCards} onChange={setBlurCards} />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowActions')!}
        help={t('Customize.allowActionsHelp')!}
      >
        <BooleanOption value={options.allowActions} onChange={setAllowAction} />
      </OptionItem>
      {capabilities.disableShowAuthor ? null : (
        <OptionItem
          label={t('Customize.allowAuthorVisible')!}
          help={t('Customize.allowAuthorVisibleHelp')!}
        >
          <BooleanOption
            value={options.allowAuthorVisible}
            onChange={setAllowAuthorVisible}
          />
        </OptionItem>
      )}
      <OptionItem
        label={t('Customize.newPostsFirst')!}
        help={t('Customize.newPostsFirstHelp')!}
      >
        <BooleanOption
          value={options.newPostsFirst}
          onChange={setNewPostsFirst}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowReordering')!}
        help={t('Customize.allowReorderingHelp')!}
      >
        <BooleanOption
          value={options.allowReordering}
          onChange={setAllowReordering}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.restrictReorderingToOwner')!}
        help={t('Customize.restrictReorderingToOwnerHelp')!}
      >
        <BooleanOption
          value={options.restrictReorderingToModerator}
          onChange={setRestrictReorderingToOwner}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowGrouping')!}
        help={t('Customize.allowGroupingHelp')!}
      >
        <BooleanOption
          value={options.allowGrouping}
          onChange={setAllowGrouping}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.restrictGroupingToOwner')!}
        help={t('Customize.restrictGroupingToOwnerHelp')!}
      >
        <BooleanOption
          value={options.restrictGroupingToModerator}
          onChange={setRestrictGroupingToOwner}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowGiphy')!}
        help={t('Customize.allowGiphyHelp')!}
      >
        <BooleanOption value={options.allowGiphy} onChange={setAllowGiphy} />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowReactions')!}
        help={t('Customize.allowReactionsHelp')!}
      >
        <BooleanOption
          value={options.allowReactions}
          onChange={setAllowReactions}
        />
      </OptionItem>
    </SettingCategory>
  );
}

export default PostsSection;
