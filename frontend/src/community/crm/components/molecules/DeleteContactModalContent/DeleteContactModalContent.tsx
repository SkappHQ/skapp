import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteContact } from "~community/crm/api/ContactApi";
import { useCrmStore } from "~community/crm/store/store";

const DeleteContactModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedContact,
    setSelectedContact,
    setIsCrmSidePanelOpen,
    setIsContactModalOpen
  } = useCrmStore((store) => ({
    selectedContact: store.selectedContact,
    setSelectedContact: store.setSelectedContact,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setIsContactModalOpen: store.setIsContactModalOpen
  }));

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "deleteContactModal"
  );

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"], {
        contactName: selectedContact?.name
      })
    });

    handleCloseModal();
    setIsCrmSidePanelOpen(false);
    setSelectedContact(null);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteContact, isPending } = useDeleteContact(
    handleSuccess,
    handleError
  );

  const handleDeleteContact = () => {
    if (selectedContact?.id === undefined) return;
    deleteContact(selectedContact.id);
  };

  return (
    <div className="flex flex-col">
      <div>
        {translateText(["description"], { contactName: selectedContact?.name })}
      </div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="error"
          type="button"
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
          onClick={handleDeleteContact}
          disabled={isPending}
          aria-label={translateText(["ariaLabels", "confirm"])}
        >
          {translateText(["buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteContactModalContent;
