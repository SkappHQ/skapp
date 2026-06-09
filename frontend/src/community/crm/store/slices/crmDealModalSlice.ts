import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmDealModalSlice = (set: SetType<CrmDealModalSliceTypes>) => ({
  isDealDeleteModalOpen: false,
  dealToDelete: null,
  setIsDealDeleteModalOpen: (isDealDeleteModalOpen: boolean) =>
    set({ isDealDeleteModalOpen }),
  setDealToDelete: (dealToDelete: string | null) => set({ dealToDelete })
});

export default CrmDealModalSlice;
