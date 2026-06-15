import { SetType } from "~community/common/types/storeTypes";
import { CrmModalTypes } from "~community/configurations/types/CrmTypes";

export interface DealStageSliceType {
  isAddDealStageModalOpen: boolean;
  dealStageModalType: CrmModalTypes;
  setIsAddDealStageModalOpen: (open: boolean) => void;
  setDealStageModalType: (modalType: CrmModalTypes) => void;
}

export const dealStageSlice = (
  set: SetType<DealStageSliceType>
): DealStageSliceType => ({
  isAddDealStageModalOpen: false,
  dealStageModalType: CrmModalTypes.ADD_DEAL_STAGE_MODAL,
  setIsAddDealStageModalOpen: (open) =>
    set((state) => ({ ...state, isAddDealStageModalOpen: open })),
  setDealStageModalType: (modalType) =>
    set((state) => ({ ...state, dealStageModalType: modalType }))
});
