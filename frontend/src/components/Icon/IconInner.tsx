import { Emoji } from 'emoji-mart';

type IconProps = {
  icon: string | null;
  size?: number;
};

export default function IconInner({ icon, size }: IconProps) {
  return <Emoji emoji={icon || 'spy'} size={size || 24} />;
}
