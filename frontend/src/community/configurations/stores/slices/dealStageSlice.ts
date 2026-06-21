import { SetType } from "~community/common/types/storeTypes";
import { DealStageSliceTypes } from "~community/configurations/types/zustand/SliceTypes";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const DealStageSlice = (set: SetType<DealStageSliceTypes>) => ({
  isDealStageModalOpen: false,
  dealStageModalType: CrmModalTypes.ADD_DEAL_STAGE_MODAL,
  selectedDealStage: null,
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) =>
    set({ isDealStageModalOpen: isDealStageModalOpen }),
  setDealStageModalType: (dealStageModalType: CrmModalTypes) =>
    set({ dealStageModalType: dealStageModalType }),
  setSelectedDealStage: (stage: CrmDealStageType | null) =>
    set({ selectedDealStage: stage })
});

export default DealStageSlice;
