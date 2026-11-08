import { useCallback, useEffect } from 'react';
import data from '@emoji-mart/data';
import EmojiMartPicker from 'components/Icon/EmojiMartPicker';
import Icon from 'components/Icon/Icon';
import { initEmojiMart } from 'components/Icon/emoji-mart';
import useModal from 'hooks/useModal';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';

interface IconPickerProps {
  value: string | null;
  onChange: (value: string) => void;
}

type EmojiSelectPayload = {
  id: string;
};

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const { i18n } = useTranslation();
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
    [onChange, close],
  );

  return (
    <Popover
      open={opened}
      onOpenChange={(next) => {
        if (next) {
          open();
        } else {
          close();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-10 px-2">
          <Icon icon={value || 'grey_question'} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[70] w-auto p-0">
        <EmojiMartPicker
          data={data}
          onEmojiSelect={handleChange}
          theme="light"
          language={i18n.language}
        />
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
