import { useCallback } from 'react';
import { SessionOptions } from 'common';
import SettingCategory from '../SettingCategory';
import OptionItem from '../OptionItem';
import { useTranslation } from 'react-i18next';
import BooleanOption from '../BooleanOption';
import MaxVoteSlider from './MaxVoteSlider';

interface VotingSectionProps {
  options: SessionOptions;
  onChange: (options: SessionOptions) => void;
}

function VotingSection({ options, onChange }: VotingSectionProps) {
  const { t } = useTranslation();

  const setAllowSelfVoting = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowSelfVoting: value,
      });
    },
    [onChange, options]
  );
  const setAllowMultipleVotes = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowMultipleVotes: value,
      });
    },
    [onChange, options]
  );
  const setAllowCancelVote = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowCancelVote: value,
      });
    },
    [onChange, options]
  );
  const setMaxUpVotes = useCallback(
    (value: number | null) => {
      onChange({
        ...options,
        maxUpVotes: value,
      });
    },
    [onChange, options]
  );
  const setMaxDownVotes = useCallback(
    (value: number | null) => {
      onChange({
        ...options,
        maxDownVotes: value,
      });
    },
    [onChange, options]
  );
  return (
    <SettingCategory
      title={t('Customize.votingCategory')!}
      subtitle={t('Customize.votingCategorySub')!}
    >
      <OptionItem
        label={t('Customize.maxUpVotes')!}
        help={t('Customize.maxUpVotesHelp')!}
        wide
      >
        <MaxVoteSlider value={options.maxUpVotes} onChange={setMaxUpVotes} />
      </OptionItem>
      <OptionItem
        label={t('Customize.maxDownVotes')!}
        help={t('Customize.maxDownVotesHelp')!}
        wide
      >
        <MaxVoteSlider
          value={options.maxDownVotes}
          onChange={setMaxDownVotes}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowSelfVoting')!}
        help={t('Customize.allowSelfVotingHelp')!}
      >
        <BooleanOption
          value={options.allowSelfVoting}
          onChange={setAllowSelfVoting}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowMultipleVotes')!}
        help={t('Customize.allowMultipleVotesHelp')!}
      >
        <BooleanOption
          value={options.allowMultipleVotes}
          onChange={setAllowMultipleVotes}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.allowCancelVote')!}
        help={t('Customize.allowCancelVoteHelp')!}
      >
        <BooleanOption
          value={options.allowCancelVote}
          onChange={setAllowCancelVote}
        />
      </OptionItem>
    </SettingCategory>
  );
}

export default VotingSection;
