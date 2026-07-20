import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { CommonModalData } from "~community/common/types/CommonModalTypes";
import { SetType } from "~community/common/types/storeTypes";

export interface CommonModalSliceType {
  commonModalType: CommonModalType;
  isCommonModalOpen: boolean;
  commonModalData: CommonModalData | null;
  openCommonModal: (modalType: CommonModalType, data?: CommonModalData) => void;
  closeCommonModal: () => void;
}

export const commonModalSlice = (
  set: SetType<CommonModalSliceType>
): CommonModalSliceType => ({
  commonModalType: CommonModalType.NONE,
  isCommonModalOpen: false,
  commonModalData: null,
  openCommonModal: (modalType: CommonModalType, data?: CommonModalData) =>
    set({
      commonModalType: modalType,
      commonModalData: data ?? null,
      isCommonModalOpen: true
    }),
  closeCommonModal: () =>
    set({
      isCommonModalOpen: false,
      commonModalType: CommonModalType.NONE,
      commonModalData: null
    })
});
