import { Emoji } from 'emoji-mart';

export function getIcon(name: string | null): React.ReactElement | null {
  return <Emoji emoji={name || 'spy'} size={24} />;
}
