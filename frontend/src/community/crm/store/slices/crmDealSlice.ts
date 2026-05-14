import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealSlice = (set: SetType<CrmDealSliceTypes>) => ({
  isAddDealSidePanelOpen: false,
  setIsAddDealSidePanelOpen: (isOpen: boolean) =>
    set({ isAddDealSidePanelOpen: isOpen })
});

export default CrmDealSlice;
