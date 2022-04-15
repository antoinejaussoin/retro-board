import { useCallback, useRef } from 'react';
import { Button, Popover } from '@mui/material';
import styled from '@emotion/styled';
import { Picker, EmojiData } from 'emoji-mart';
import useModal from 'hooks/useModal';
import Icon from 'components/Icon/Icon';

interface IconPickerProps {
  value: string | null;
  onChange: (value: string) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [opened, open, close] = useModal();
  const handleChange = useCallback(
    (emoji: EmojiData) => {
      if (emoji.colons) {
        onChange(emoji.colons);
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
        <Picker onSelect={handleChange} />
      </Popover>
    </Container>
  );
};

const Container = styled.div``;

export default IconPicker;
