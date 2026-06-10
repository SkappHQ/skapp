import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { CrmDealModalTypes } from "~community/crm/types/ModalTypes";
import { CrmDealModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealModalSlice = (set: SetType<CrmDealModalSliceTypes>) => ({
  isDealModalOpen: false,
  dealModalType: CrmDealModalTypes.NONE,
  currentDeletingDeal: null,
  setIsDealModalOpen: (isDealModalOpen: boolean) => set({ isDealModalOpen }),
  setDealModalType: (dealModalType: CrmDealModalTypes) =>
    set({ dealModalType }),
  setCurrentDeletingDeal: (currentDeletingDeal: CrmDealType | null) =>
    set({ currentDeletingDeal })
});

export default CrmDealModalSlice;
