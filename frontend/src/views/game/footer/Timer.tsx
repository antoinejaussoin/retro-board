import styled from '@emotion/styled';
import { PlayArrow, Stop, TimerOutlined } from '@mui/icons-material';
import { Color, colors, IconButton } from '@mui/material';
import { differenceInSeconds } from 'date-fns';
import { noop } from 'lodash';
import { useConfirm } from 'material-ui-confirm';
import { useCallback, useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimer } from '../useTimer';

type TimerProps = {
  duration: number;
  canControl: boolean;
  onStart: () => void;
  onStop: () => void;
};

export const Timer = memo(function Timer({
  duration,
  canControl,
  onStart,
  onStop,
}: TimerProps) {
  const confirm = useConfirm();
  const end = useTimer();
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState<Time>(
    getTime(end, duration, end ? differenceInSeconds(end, new Date()) : null)
  );

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
      setRemaining(getTime(null, duration, null));
      return;
    }
    const handle = setInterval(() => {
      const time = getTime(end, duration, differenceInSeconds(end, new Date()));
      setRemaining(time);
    }, 1000);

    return () => clearInterval(handle);
  }, [end, duration]);

  const color = getColor(duration, end);

  return (
    <Container>
      <TimerOutlined fontSize="large" htmlColor={color[600]} />
      <Remaining color={color[400]}>
        {remaining.minutes}:{remaining.seconds}
      </Remaining>
      {canControl ? (
        end ? (
          <IconButton onClick={handleStop}>
            <Stop />
          </IconButton>
        ) : (
          <IconButton onClick={onStart}>
            <PlayArrow />
          </IconButton>
        )
      ) : null}
    </Container>
  );
});

type Time = {
  minutes: string;
  seconds: string;
};

function getTime(
  end: Date | null,
  duration: number,
  left: number | null
): Time {
  const remaining =
    end === null || left === null ? duration : Math.max(0, left);
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  return { minutes, seconds };
}

function getColor(totalDuration: number, end: Date | null): Color {
  if (!end) {
    return colors.grey;
  }
  const remainingRatio = differenceInSeconds(end, new Date()) / totalDuration;
  if (remainingRatio > 0.25) {
    return colors.green;
  }
  if (remainingRatio > 0.1) {
    return colors.orange;
  }
  return colors.red;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Remaining = styled.div`
  font-family: 'DIGITALDREAM';
  font-size: 1.5rem;
  color: ${(props) => props.color};
`;
