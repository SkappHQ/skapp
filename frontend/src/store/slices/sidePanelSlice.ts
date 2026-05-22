import { SetType } from "~community/common/types/CommonTypes";

export interface SidePanelSlice {
  isSidePanelOpen: boolean;
  panelItemId: number | null;
  openCreatePanel: () => void;
  openSidePanel: (itemId: number) => void;
  closeSidePanel: () => void;
}

export const createSidePanelSlice = (
  set: SetType<SidePanelSlice>
): SidePanelSlice => ({
  isSidePanelOpen: false,
  panelItemId: null,
  openCreatePanel: () => set({ isSidePanelOpen: true, panelItemId: null }),
  openSidePanel: (itemId: number) =>
    set({ isSidePanelOpen: true, panelItemId: itemId }),
  closeSidePanel: () => set({ isSidePanelOpen: false, panelItemId: null })
});
