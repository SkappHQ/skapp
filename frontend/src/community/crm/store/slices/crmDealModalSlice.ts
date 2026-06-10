import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealModalSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CrmDealModalSlice = (set: SetType<CrmDealModalSliceTypes>) => ({
  isDealModalOpen: false,
  dealModalType: CrmModalTypes.DELETE_DEAL_MODAL,
  dealToDelete: null,
  setIsDealModalOpen: (isDealModalOpen: boolean) =>
    set({ isDealModalOpen }),
  setDealModalType: (dealModalType: CrmModalTypes) =>
    set({ dealModalType }),
  setDealToDelete: (dealToDelete: string | null) => set({ dealToDelete })
});

export default CrmDealModalSlice;
