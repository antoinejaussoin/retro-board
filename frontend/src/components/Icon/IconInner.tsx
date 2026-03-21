type IconProps = {
  icon: string | null;
  size?: number;
};

export default function IconInner({ icon, size }: IconProps) {
  const shortcodes = icon
    ? icon.startsWith(':')
      ? icon
      : `:${icon}:`
    : ':grey_question:';
  return <em-emoji shortcodes={shortcodes} size={`${size || 24}px`} />;
}
