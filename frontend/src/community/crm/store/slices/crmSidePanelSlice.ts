import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmSidePanelSlice = (set: SetType<CrmSidePanelSliceTypes>) => ({
  isSidePanelOpen: false,
  openSidePanel: () => set({ isSidePanelOpen: true }),
  closeSidePanel: () => set({ isSidePanelOpen: false })
});

export default CrmSidePanelSlice;
