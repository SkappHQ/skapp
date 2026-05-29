import { SetType } from "~community/common/types/CommonTypes";
import { CrmAddDealSidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmAddDealSidePanelSlice = (
  set: SetType<CrmAddDealSidePanelSliceTypes>
) => ({
  isAddDealSidePanelOpen: false,
  setIsAddDealSidePanelOpen: (isOpen: boolean) =>
    set({ isAddDealSidePanelOpen: isOpen })
});

export default CrmAddDealSidePanelSlice;
