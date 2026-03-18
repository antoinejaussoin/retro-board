import { createContext, type PropsWithChildren, useCallback, useState } from 'react';

interface SidePanelContextValue {
  opened: boolean;
  toggle: () => void;
}

export const SidePanelContext = createContext<SidePanelContextValue>({
  opened: false,
  toggle: () => {},
});

export function SidePanelProvider({ children }: PropsWithChildren) {
  const [opened, setOpened] = useState(false);

  const toggle = useCallback(() => {
    setOpened((v) => !v);
  }, []);

  return (
    <SidePanelContext.Provider value={{ opened, toggle }}>
      {children}
    </SidePanelContext.Provider>
  );
}
