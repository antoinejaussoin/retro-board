import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { PanelToggledState } from './state';

interface UseSidePanelResult {
  opened: boolean;
  toggle: () => void;
}

export default function useSidePanel(): UseSidePanelResult {
  const [value, setValue] = useRecoilState(PanelToggledState);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, [setValue]);

  return {
    opened: value,
    toggle,
  };
}
