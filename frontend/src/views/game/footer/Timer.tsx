import { SessionOptions } from 'common';
import { differenceInSeconds } from 'date-fns';
import useModal from 'hooks/useModal';
import { noop } from 'lodash';
import { Play, Settings, Square, Timer as TimerIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui/cn';
import { useConfirm } from 'ui/confirm';
import { IconButton } from 'ui/icon-button';
import { useTimer } from '../useTimer';
import { TimerSettingsModal } from './TimerSettingsModal';

type TimerProps = {
  options: SessionOptions;
  canControl: boolean;
  onStart: () => void;
  onStop: () => void;
  onConfigure: (options: SessionOptions) => void;
};

export const Timer = memo(function Timer({
  canControl,
  options,
  onStart,
  onStop,
  onConfigure,
}: TimerProps) {
  const confirm = useConfirm();
  const end = useTimer();
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState<Time>(
    getTime(
      end,
      options.timerDuration,
      end ? differenceInSeconds(end, new Date()) : null,
    ),
  );
  const [opened, open, close] = useModal();

  const handleStop = useCallback(() => {
    confirm({
      title: t('Timer.stopTimerTitle'),
      description: t('Timer.stopTimerDescription'),
      confirmationText: t('Timer.stopTimerButton'),
      cancellationText: t('Timer.stopTimerCancelButton'),
    })
      .then(() => {
        onStop();
      })
      .catch(noop);
  }, [onStop, confirm, t]);

  useEffect(() => {
    if (!end) {
      setRemaining(getTime(null, options.timerDuration, null));
      return;
    }
    const handle = setInterval(() => {
      const time = getTime(
        end,
        options.timerDuration,
        differenceInSeconds(end, new Date()),
      );
      setRemaining(time);
    }, 1000);

    return () => clearInterval(handle);
  }, [end, options.timerDuration]);

  const tone = timerTone(options.timerDuration, end);

  return (
    <div className="flex items-center gap-1">
      {options.allowTimer || canControl ? (
        <TimerIcon className={cn('size-6', tone)} />
      ) : null}
      {options.allowTimer ? (
        <>
          <span
            className={cn(
              'font-timer text-2xl leading-none whitespace-nowrap',
              tone,
            )}
          >
            {remaining.minutes}:{remaining.seconds}
          </span>
          {canControl ? (
            end ? (
              <IconButton
                onClick={handleStop}
                aria-label={t('Timer.stopTimerButton')}
                className="size-8"
              >
                <Square className="size-4" />
              </IconButton>
            ) : (
              <IconButton
                onClick={onStart}
                aria-label="Start timer"
                className="size-8"
              >
                <Play className="size-4" />
              </IconButton>
            )
          ) : null}
        </>
      ) : null}
      {canControl ? (
        <IconButton
          onClick={open}
          aria-label={t('Customize.timerCategory')}
          className="size-8"
        >
          <Settings className="size-4" />
        </IconButton>
      ) : null}
      {opened ? (
        <TimerSettingsModal
          open
          onClose={close}
          onChange={(updatedOptions) => {
            if (!updatedOptions.allowTimer && !!end) {
              onStop();
            }
            onConfigure(updatedOptions);
            close();
          }}
          options={options}
        />
      ) : null}
    </div>
  );
});

type Time = {
  minutes: string;
  seconds: string;
};

function getTime(
  end: Date | null,
  duration: number,
  left: number | null,
): Time {
  const remaining =
    end === null || left === null ? duration : Math.max(0, left);
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  return { minutes, seconds };
}

function timerTone(totalDuration: number, end: Date | null): string {
  if (!end) {
    return 'text-stone-400';
  }
  const remainingRatio = differenceInSeconds(end, new Date()) / totalDuration;
  if (remainingRatio > 0.25) {
    return 'text-emerald-500';
  }
  if (remainingRatio > 0.1) {
    return 'text-amber-500';
  }
  return 'text-red-500';
}
