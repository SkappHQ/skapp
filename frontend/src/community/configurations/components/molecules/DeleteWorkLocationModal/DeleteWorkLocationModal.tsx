import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteWorkLocation } from "~community/configurations/api/WorkLocationApi";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";

const DeleteWorkLocationModal = () => {
  const translateText = useTranslator("configurations", "workLocation");
  const { setToastMessage } = useToast();

  const {
    isDeleteModalOpen,
    selectedLocationId,
    setIsDeleteModalOpen,
    setSelectedLocationId
  } = useWorkLocationStore();

  const handleClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedLocationId(null);
  };

  const { mutate: deleteLocation, isPending } = useDeleteWorkLocation(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toasts.deleteSuccess.title"]),
        description: translateText(["toasts.deleteSuccess.description"]),
        isIcon: true
      });
      handleClose();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toasts.error.title"]),
        description: translateText(["toasts.error.description"]),
        isIcon: true
      });
      handleClose();
    }
  );

  const handleConfirm = () => {
    if (selectedLocationId !== null) {
      deleteLocation(selectedLocationId);
    }
  };

  const content = (
    <div>
      <p>{translateText(["deleteModal.description"])}</p>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant="tertiary"
          onClick={handleClose}
          disabled={isPending}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["deleteModal.cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="error"
          onClick={handleConfirm}
          disabled={isPending}
          icon={<Icon name={IconName.DELETE_BUTTON_ICON} fill="var(--color-semantic-red-text)" />}
          iconPosition="end"
        >
          {translateText(["deleteModal.confirmButton"])}
        </ButtonV2>
      </div>
    </div>
  );

  return (
    <SmallModal
      isOpen={isDeleteModalOpen}
      onClose={handleClose}
      modalHeader={translateText(["deleteModal.title"])}
      content={content}
    />
  );
};

export default DeleteWorkLocationModal;
