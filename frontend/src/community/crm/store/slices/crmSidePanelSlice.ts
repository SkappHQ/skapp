import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmSidePanelSlice = (set: SetType<CrmSidePanelSliceTypes>) => ({
  isCrmSidePanelOpen: false,
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) =>
    set({ isCrmSidePanelOpen }),
  preselectedStageId: null,
  setPreselectedStageId: (preselectedStageId: number | null) =>
    set({ preselectedStageId })
});

export default CrmSidePanelSlice;
