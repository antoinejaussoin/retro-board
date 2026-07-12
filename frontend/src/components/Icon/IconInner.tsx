import { useEffect } from 'react';
import { emojiElementProps, initEmojiMart } from './emoji-mart';

type IconProps = {
  icon: string | null;
  size?: number;
};

export default function IconInner({ icon, size }: IconProps) {
  useEffect(() => {
    void initEmojiMart();
  }, []);

  const emojiProps = emojiElementProps(icon);
  const px = size || 24;

  return (
    // emoji-mart v5 web component (React 19-safe; v3 mutated props)
    <em-emoji {...emojiProps} size={`${px}px`} set="native" />
  );
}
