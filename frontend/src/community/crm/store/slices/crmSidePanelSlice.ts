import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmSidePanelSlice = (
  set: SetType<CrmSidePanelSliceTypes>
) => ({
  isCrmSidePanelOpen: false,
  setIsCrmSidePanelOpen: (isCrmSidePanelOpen: boolean) =>
    set({ isCrmSidePanelOpen })
});

export default CrmSidePanelSlice;
