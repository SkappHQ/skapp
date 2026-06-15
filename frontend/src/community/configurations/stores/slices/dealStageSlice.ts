import { SetType } from "~community/common/types/storeTypes";
import { DealStageSliceTypes } from "~community/configurations/types/zustand/SliceTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const DealStageSlice = (set: SetType<DealStageSliceTypes>) => ({
  isDealStageModalOpen: false,
  dealStageModalType: CrmModalTypes.ADD_DEAL_STAGE_MODAL,
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) =>
    set({ isDealStageModalOpen: isDealStageModalOpen }),
  setDealStageModalType: (dealStageModalType: CrmModalTypes) =>
    set({ dealStageModalType: dealStageModalType })
});

export default DealStageSlice;
