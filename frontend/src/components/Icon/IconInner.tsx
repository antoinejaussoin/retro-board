import { Emoji } from 'emoji-mart';

type IconProps = {
  icon: string | null;
  size?: number;
};

export default function IconInner({ icon, size }: IconProps) {
  return <Emoji emoji={icon || 'grey_question'} size={size || 24} />;
}
