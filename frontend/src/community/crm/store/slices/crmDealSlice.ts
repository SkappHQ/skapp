import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealSortOrder } from "~community/crm/enums/common";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealSlice = (set: SetType<CrmDealSliceTypes>) => ({
  isAddDealSidePanelOpen: false,
  setIsAddDealSidePanelOpen: (isOpen: boolean) =>
    set({ isAddDealSidePanelOpen: isOpen }),
  dealSortOrder: CrmDealSortOrder.NEWEST,
  setDealSortOrder: (order: CrmDealSortOrder) => set({ dealSortOrder: order })
});

export default CrmDealSlice;
