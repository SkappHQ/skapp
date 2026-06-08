import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddContactModalContent from "../../molecules/AddContactModalContent/AddContactModalContent";

const ContactModalController = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const { isAddContactModalOpen, contactModalType, setIsAddContactModalOpen } =
    useCrmStore((store) => ({
      isAddContactModalOpen: store.isAddContactModalOpen,
      contactModalType: store.contactModalType,
      setIsAddContactModalOpen: store.setIsAddContactModalOpen
    }));

  const handleCloseModal = (): void => {
    setIsAddContactModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return translateText(["addContactModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (contactModalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return <AddContactModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isAddContactModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(contactModalType)}
      content={getModalContent()}
    />
  );
};

export default ContactModalController;
