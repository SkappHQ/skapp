import { SetType } from "~community/common/types/storeTypes";
import { CrmModalTypes } from "~community/configurations/types/CrmTypes";
import { DealStageSliceTypes } from "~community/configurations/types/zustand/SliceTypes";

const DealStageSlice = (set: SetType<DealStageSliceTypes>) => ({
  isDealStageModalOpen: false,
  dealStageModalType: CrmModalTypes.ADD_DEAL_STAGE_MODAL,
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) =>
    set({ isDealStageModalOpen: isDealStageModalOpen }),
  setDealStageModalType: (dealStageModalType: CrmModalTypes) =>
    set({ dealStageModalType: dealStageModalType })
});

export default DealStageSlice;
