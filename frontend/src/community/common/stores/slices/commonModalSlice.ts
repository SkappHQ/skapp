import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { SetType } from "~community/common/types/storeTypes";

export interface CommonModalSliceType {
  commonModalType: CommonModalType;
  isCommonModalOpen: boolean;
  openCommonModal: (modalType: CommonModalType) => void;
  closeCommonModal: () => void;
}

export const commonModalSlice = (
  set: SetType<CommonModalSliceType>
): CommonModalSliceType => ({
  commonModalType: CommonModalType.NONE,
  isCommonModalOpen: false,
  openCommonModal: (modalType: CommonModalType) =>
    set((state) => ({
      ...state,
      commonModalType: modalType,
      isCommonModalOpen: true
    })),
  closeCommonModal: () =>
    set((state) => ({
      ...state,
      isCommonModalOpen: false,
      commonModalType: CommonModalType.NONE
    }))
});
