import { useCallback } from 'react';
import { SessionOptions } from '@retrospected/common';
import SettingCategory from '../SettingCategory';
import OptionItem from '../OptionItem';
import useTranslations from '../../../../translations';
import BooleanOption from '../BooleanOption';
import MaxVoteSlider from './MaxVoteSlider';

interface VotingSectionProps {
  options: SessionOptions;
  onChange: (options: SessionOptions) => void;
}

function VotingSection({ options, onChange }: VotingSectionProps) {
  const translations = useTranslations();
  const { Customize } = translations;

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
      title={Customize.votingCategory!}
      subtitle={Customize.votingCategorySub!}
    >
      <OptionItem
        label={Customize.maxUpVotes!}
        help={Customize.maxUpVotesHelp!}
        wide
      >
        <MaxVoteSlider value={options.maxUpVotes} onChange={setMaxUpVotes} />
      </OptionItem>
      <OptionItem
        label={Customize.maxDownVotes!}
        help={Customize.maxDownVotesHelp!}
        wide
      >
        <MaxVoteSlider
          value={options.maxDownVotes}
          onChange={setMaxDownVotes}
        />
      </OptionItem>
      <OptionItem
        label={Customize.allowSelfVoting!}
        help={Customize.allowSelfVotingHelp!}
      >
        <BooleanOption
          value={options.allowSelfVoting}
          onChange={setAllowSelfVoting}
        />
      </OptionItem>
      <OptionItem
        label={Customize.allowMultipleVotes!}
        help={Customize.allowMultipleVotesHelp!}
      >
        <BooleanOption
          value={options.allowMultipleVotes}
          onChange={setAllowMultipleVotes}
        />
      </OptionItem>
    </SettingCategory>
  );
}

export default VotingSection;
