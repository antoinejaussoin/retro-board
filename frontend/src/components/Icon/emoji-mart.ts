import data from '@emoji-mart/data';
import { init } from 'emoji-mart';

let initPromise: Promise<void> | null = null;

export function initEmojiMart(): Promise<void> {
  if (!initPromise) {
    initPromise = init({ data });
  }
  return initPromise;
}

/** Normalize stored icon values (`question` or `:question:`) for em-emoji. */
export function emojiElementProps(icon: string | null): {
  id?: string;
  shortcodes?: string;
} {
  const value = icon || 'grey_question';
  if (value.includes(':')) {
    return { shortcodes: value };
  }
  return { id: value };
}
