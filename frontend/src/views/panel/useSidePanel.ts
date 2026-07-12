import { usePanelStore } from './state';

interface UseSidePanelResult {
  opened: boolean;
  toggle: () => void;
}

export default function useSidePanel(): UseSidePanelResult {
  const opened = usePanelStore((s) => s.opened);
  const toggle = usePanelStore((s) => s.toggle);

  return {
    opened,
    toggle,
  };
}
