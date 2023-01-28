import { useCallback } from 'react';
import { SessionOptions } from 'common';
import SettingCategory from '../SettingCategory';
import OptionItem from '../OptionItem';
import { useTranslation } from 'react-i18next';
import BooleanOption from '../BooleanOption';
import DurationSelection from './DurationSelection';

interface TimerSectionProps {
  options: SessionOptions;
  onChange: (options: SessionOptions) => void;
}

function TimerSection({ options, onChange }: TimerSectionProps) {
  const { t } = useTranslation();

  const setAllowTimer = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        allowTimer: value,
      });
    },
    [onChange, options]
  );

  const setReadonlyOnTimerEnd = useCallback(
    (value: boolean) => {
      onChange({
        ...options,
        readonlyOnTimerEnd: value,
      });
    },
    [onChange, options]
  );

  const setTimerDuration = useCallback(
    (value: number) => {
      onChange({
        ...options,
        timerDuration: value,
      });
    },
    [onChange, options]
  );

  return (
    <SettingCategory
      title={t('Customize.timerCategory')!}
      subtitle={t('Customize.timerCategorySub')!}
    >
      <OptionItem
        label={t('Customize.allowTimer')!}
        help={t('Customize.allowTimerHelp')!}
      >
        <BooleanOption value={options.allowTimer} onChange={setAllowTimer} />
      </OptionItem>
      <OptionItem
        label={t('Customize.timerDuration')!}
        help={
          t('Customize.timerDurationHelp', {
            duration: options.timerDuration / 60,
          })!
        }
        wide
      >
        <DurationSelection
          duration={options.timerDuration}
          onChange={setTimerDuration}
        />
      </OptionItem>
      <OptionItem
        label={t('Customize.lockOnTimerEnd')!}
        help={t('Customize.lockOnTimerEndHelp')!}
      >
        <BooleanOption
          value={options.readonlyOnTimerEnd}
          onChange={setReadonlyOnTimerEnd}
        />
      </OptionItem>
    </SettingCategory>
  );
}

export default TimerSection;
