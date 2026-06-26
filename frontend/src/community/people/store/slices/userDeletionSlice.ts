import { SetType } from "~community/common/types/storeTypes";

interface UserDeletionModalSliceType {
  isDeletionConfirmationModalOpen: boolean;
  isDeletionAlertOpen: boolean;
  setDeletionConfirmationModalOpen: (value: boolean) => void;
  setDeletionAlertOpen: (value: boolean) => void;
  deletionAlertMessage: string;
  setDeletionAlertMessage: (value: string) => void;
}

export const userDeletionModalSlice = (
  set: SetType<UserDeletionModalSliceType>
): UserDeletionModalSliceType => ({
  isDeletionConfirmationModalOpen: false,
  isDeletionAlertOpen: false,
  setDeletionConfirmationModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isDeletionConfirmationModalOpen: value
    })),
  setDeletionAlertOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isDeletionAlertOpen: value
    })),
  deletionAlertMessage: "",
  setDeletionAlertMessage: (value: string) =>
    set((state) => ({
      ...state,
      deletionAlertMessage: value
    }))
});
