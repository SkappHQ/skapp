import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { CrmDealModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealModalSlice = (set: SetType<CrmDealModalSliceTypes>) => ({
  isDealModalOpen: false,
  currentDeletingDeal: null,
  setIsDealModalOpen: (isDealModalOpen: boolean) => set({ isDealModalOpen }),
  setCurrentDeletingDeal: (currentDeletingDeal: CrmDealType | null) =>
    set({ currentDeletingDeal })
});

export default CrmDealModalSlice;
