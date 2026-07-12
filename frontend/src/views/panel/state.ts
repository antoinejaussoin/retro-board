import { atom } from 'recoil';

export const PanelToggledState = atom<boolean>({
  key: 'PANEL_TOGGLED',
  default: false,
});
