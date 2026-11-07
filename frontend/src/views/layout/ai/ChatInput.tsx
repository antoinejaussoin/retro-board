import { Send } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import { Input } from 'ui/input';

type ChatInputProps = {
  disabled: boolean;
  onMessage: (content: string) => void;
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

export default function ChatInput({ disabled, onMessage }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { t } = useTranslation();

  const handleSend = useCallback(() => {
    if (input.length) {
      onMessage(input);
      setInput('');
    }
  }, [input, onMessage]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isEnter(event.nativeEvent.code) && !event.nativeEvent.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-center gap-3">
      <Input
        className="min-w-0 flex-1"
        disabled={disabled}
        placeholder={t('Ai.inputPrompt') ?? ''}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyPress}
      />
      <Button disabled={disabled || !input.length} onClick={handleSend}>
        {t('Ai.send')}
        <Send className="size-4" />
      </Button>
    </div>
  );
}
