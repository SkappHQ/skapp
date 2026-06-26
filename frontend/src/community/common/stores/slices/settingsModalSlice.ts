import { SettingsModalTypes } from "~community/common/types/SettingsTypes";
import { SetType } from "~community/common/types/storeTypes";

interface SettingsModalSliceType {
  modalType: SettingsModalTypes;
  setModalType: (value: SettingsModalTypes) => void;
  isModalOpen: boolean;
  setModalOpen: (value: boolean) => void;
}

export const settingsModalSlice = (
  set: SetType<SettingsModalSliceType>
): SettingsModalSliceType => ({
  modalType: SettingsModalTypes.CHANGE_ORGANIZATION_SETTINGS,
  setModalType: (value: SettingsModalTypes) =>
    set((state) => ({
      ...state,
      modalType: value
    })),
  isModalOpen: false,
  setModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isModalOpen: value
    }))
});
