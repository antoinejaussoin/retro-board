import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { Picker } from 'emoji-mart';
import { emojiMartLocale, loadEmojiMartI18n } from './emoji-mart';

type EmojiSelectPayload = {
  id: string;
  native?: string;
};

type EmojiMartPickerProps = {
  data: unknown;
  onEmojiSelect: (emoji: EmojiSelectPayload) => void;
  theme?: 'auto' | 'light' | 'dark';
  /** App language code (`fr-FR`, `en-GB`, …). Falls back to English when unsupported. */
  language?: string;
};

/**
 * Mounts emoji-mart's custom element directly.
 * @emoji-mart/react only peers React 16–18, and its wrapper is this same constructor call.
 */
export default function EmojiMartPicker({
  data,
  onEmojiSelect,
  theme = 'light',
  language,
}: EmojiMartPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onEmojiSelect);
  onSelectRef.current = onEmojiSelect;

  const locale = emojiMartLocale(language);
  const [i18n, setI18n] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setI18n(null);
    void loadEmojiMartI18n(locale).then((strings) => {
      if (!cancelled) {
        setI18n(strings);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent || !i18n) return;

    new Picker({
      data,
      theme,
      locale,
      i18n,
      onEmojiSelect: (emoji: EmojiSelectPayload) => {
        onSelectRef.current(emoji);
      },
      ref,
    });

    return () => {
      parent.replaceChildren();
    };
  }, [data, theme, locale, i18n]);

  return <div ref={ref} />;
}
