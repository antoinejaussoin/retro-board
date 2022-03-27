import { useCallback, useRef } from 'react';
import { Button, Popover } from '@mui/material';
import styled from '@emotion/styled';
import { Picker, EmojiData, Emoji } from 'emoji-mart';
import useModal from 'hooks/useModal';

interface IconPickerProps {
  value: string | null;
  onChange: (value: string) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [opened, open, close] = useModal();
  const handleChange = useCallback(
    (emoji: EmojiData) => {
      console.log('Picked: ', emoji);
      if (emoji.id) {
        onChange(emoji.id);
        close();
      }
    },
    [onChange, close]
  );
  return (
    <Container>
      <Button ref={ref} onClick={open}>
        <Emoji emoji={value || 'spy'} size={24} />
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
        <Picker onSelect={handleChange} />
      </Popover>
    </Container>
  );
};

const Container = styled.div``;

export default IconPicker;
