import { useLayoutEffect, useRef } from 'react';
import { Picker } from 'emoji-mart';

type EmojiSelectPayload = {
  id: string;
};

type EmojiMartPickerProps = {
  data: unknown;
  onEmojiSelect: (emoji: EmojiSelectPayload) => void;
  theme?: 'auto' | 'light' | 'dark';
};

/**
 * Mounts emoji-mart's custom element directly.
 * @emoji-mart/react only peers React 16–18, and its wrapper is this same constructor call.
 */
export default function EmojiMartPicker({
  data,
  onEmojiSelect,
  theme = 'light',
}: EmojiMartPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onEmojiSelect);
  onSelectRef.current = onEmojiSelect;

  useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    new Picker({
      data,
      theme,
      onEmojiSelect: (emoji: EmojiSelectPayload) => {
        onSelectRef.current(emoji);
      },
      ref,
    });

    return () => {
      parent.replaceChildren();
    };
  }, [data, theme]);

  return <div ref={ref} />;
}
