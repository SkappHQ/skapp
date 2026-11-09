import { useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

interface ActivitySidePanelActions {
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  handleSaveError: () => void;
  handleDeleteSuccess: () => void;
  handleDeleteError: () => void;
}

export const useActivitySidePanelActions = (
  onClose: () => void
): ActivitySidePanelActions => {
  const translateText = useTranslator("crmModule", "activities");
  const { setToastMessage } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showWarningToast = (descriptionKey: string): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.WARN,
      title: translateText(["logActivity", "toastMessages", "errorTitle"]),
      description: translateText([
        "activitySidePanel",
        "toastMessages",
        descriptionKey
      ]),
      isIcon: true
    });
  };

  const handleDeleteSuccess = (): void => {
    setIsDeleteModalOpen(false);
    onClose();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activitySidePanel",
        "toastMessages",
        "deleteSuccessTitle"
      ])
    });
  };

  const handleDeleteError = (): void => {
    setIsDeleteModalOpen(false);
    showWarningToast("deleteErrorDescription");
  };

  return {
    isDeleteModalOpen,
    openDeleteModal: () => setIsDeleteModalOpen(true),
    closeDeleteModal: () => setIsDeleteModalOpen(false),
    handleSaveError: () => showWarningToast("saveErrorDescription"),
    handleDeleteSuccess,
    handleDeleteError
  };
};
