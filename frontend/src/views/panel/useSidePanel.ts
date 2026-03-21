import { useContext } from 'react';
import { SidePanelContext } from './SidePanelContext';

interface UseSidePanelResult {
  opened: boolean;
  toggle: () => void;
}

export default function useSidePanel(): UseSidePanelResult {
  return useContext(SidePanelContext);
}
