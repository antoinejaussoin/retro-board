import { CircleHelp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip } from 'ui/tooltip';

type HelpButtonProps = {
  children: ReactNode;
  color?: string;
};

export function HelpButton({ children, color }: HelpButtonProps) {
  return (
    <Tooltip content={children}>
      <span className="inline-flex" style={{ color }}>
        <CircleHelp className="size-4" />
      </span>
    </Tooltip>
  );
}
