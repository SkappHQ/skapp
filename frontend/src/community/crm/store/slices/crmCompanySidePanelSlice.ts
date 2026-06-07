import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanySidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanySidePanelSlice = (
  set: SetType<CrmCompanySidePanelSliceTypes>
) => ({
  isCompanySidePanelOpen: false,
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) =>
    set({ isCompanySidePanelOpen })
});

export default CrmCompanySidePanelSlice;
