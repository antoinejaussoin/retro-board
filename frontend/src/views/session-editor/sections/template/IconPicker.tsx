import { useCallback, useEffect, useRef } from 'react';
import { Button, Popover } from '@mui/material';
import styled from '@emotion/styled';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import useModal from 'hooks/useModal';
import Icon from 'components/Icon/Icon';
import { initEmojiMart } from 'components/Icon/emoji-mart';

interface IconPickerProps {
  value: string | null;
  onChange: (value: string) => void;
}

type EmojiSelectPayload = {
  id: string;
};

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [opened, open, close] = useModal();

  useEffect(() => {
    void initEmojiMart();
  }, []);

  const handleChange = useCallback(
    (emoji: EmojiSelectPayload) => {
      if (emoji.id) {
        onChange(emoji.id);
        close();
      }
    },
    [onChange, close]
  );

  return (
    <Container>
      <Button
        ref={ref}
        onClick={open}
        size="small"
        style={{ padding: 5, minWidth: 40 }}
      >
        <Icon icon={value || 'grey_question'} />
      </Button>
      <Popover
        open={opened}
        anchorEl={ref.current}
        onClose={close}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Picker data={data} onEmojiSelect={handleChange} theme="light" />
      </Popover>
    </Container>
  );
};

const Container = styled.div``;

export default IconPicker;
