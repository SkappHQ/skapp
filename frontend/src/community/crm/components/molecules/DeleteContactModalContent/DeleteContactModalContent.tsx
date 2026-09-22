import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteContact } from "~community/crm/api/ContactApi";
import CrmDeleteModalContent from "~community/crm/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useCrmStore } from "~community/crm/store/store";

const DeleteContactModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const {
    selectedContactId,
    setSelectedContactId,
    closeCrmSidePanel,
    setIsContactModalOpen,
    getContactById,
    removeContact
  } = useCrmStore(
    useShallow((store) => ({
      selectedContactId: store.selectedContactId,
      setSelectedContactId: store.setSelectedContactId,
      closeCrmSidePanel: store.closeCrmSidePanel,
      setIsContactModalOpen: store.setIsContactModalOpen,
      getContactById: store.getContactById,
      removeContact: store.removeContact
    }))
  );

  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "deleteContactModal"
  );

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
  };

  const selectedContact = getContactById(selectedContactId!);

  const handleSuccess = () => {
    if (selectedContactId) removeContact(selectedContactId);

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"], {
        contactName: selectedContact?.name
      })
    });

    handleCloseModal();
    closeCrmSidePanel();
    setSelectedContactId(null);
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
    deleteContact(selectedContact.id);
  };

  return (
    <CrmDeleteModalContent
      description={translateText(["description"], {
        contactName: selectedContact?.name
      })}
      isPending={isPending}
      confirmLabel={translateText(["buttons", "confirm"])}
      cancelLabel={translateText(["buttons", "cancel"])}
      onConfirm={handleDeleteContact}
      onClose={handleCloseModal}
    />
  );
};

export default DeleteContactModalContent;
