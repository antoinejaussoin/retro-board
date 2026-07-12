import { create } from 'zustand';

type PanelStore = {
  opened: boolean;
  toggle: () => void;
};

export const usePanelStore = create<PanelStore>((set) => ({
  opened: false,
  toggle: () => set((state) => ({ opened: !state.opened })),
}));
