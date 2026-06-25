import { SetType } from "~community/common/types/CommonTypes";
import { DealSidePanelTypes } from "~community/crm/enums/common";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealSlice = (set: SetType<CrmDealSliceTypes>) => ({
  selectedDealId: null,
  setSelectedDealId: (selectedDealId: number | null) =>
    set({ selectedDealId }),
  activeDealSidePanel: null,
  setActiveDealSidePanel: (activeDealSidePanel: DealSidePanelTypes | null) =>
    set({ activeDealSidePanel })
});

export default CrmDealSlice;
