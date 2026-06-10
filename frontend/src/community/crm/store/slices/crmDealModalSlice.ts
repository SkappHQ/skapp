import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealModalSlice = (
  set: SetType<CrmDealModalSliceTypes>
): CrmDealModalSliceTypes => ({
  isDealModalOpen: false,
  currentDeletingDeal: null,
  setIsDealModalOpen: (isDealModalOpen: boolean) => set({ isDealModalOpen }),
  setCurrentDeletingDeal: (currentDeletingDeal) => set({ currentDeletingDeal })
});

export default CrmDealModalSlice;
