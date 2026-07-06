import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealSlice = (set: SetType<CrmDealSliceTypes>) => ({
  selectedDealId: null,
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId })
});

export default CrmDealSlice;
