import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddContactModalContent from "../../molecules/AddContactModalContent/AddContactModalContent";
import DeleteContactModalContent from "../../molecules/DeleteContactModalContent/DeleteContactModalContent";
import EditContactModalContent from "../../molecules/EditContactModalContent/EditContactModalContent";

const ContactModalController = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const { isContactModalOpen, contactModalType, setIsContactModalOpen } =
    useCrmStore(
      useShallow((store) => ({
        isContactModalOpen: store.isContactModalOpen,
        contactModalType: store.contactModalType,
        setIsContactModalOpen: store.setIsContactModalOpen
      }))
    );

  const handleCloseModal = (): void => {
    setIsContactModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return translateText(["addContactModal", "title"]);
      case CrmModalTypes.DELETE_CONTACT_MODAL:
        return translateText(["deleteContactModal", "title"]);
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return translateText(["editContactModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (contactModalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return <AddContactModalContent />;
      case CrmModalTypes.DELETE_CONTACT_MODAL:
        return <DeleteContactModalContent />;
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return <EditContactModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isContactModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(contactModalType)}
      content={getModalContent()}
    />
  );
};

export default ContactModalController;
