import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import EditContactModalContent from "../../molecules/EditContactModalContent/EditContactModalContent";

const ContactModalController = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const {
    isContactModalOpen,
    contactModalType,
    setIsContactModalOpen,
    setSelectedContact
  } = useCrmStore((store) => ({
    isContactModalOpen: store.isContactModalOpen,
    contactModalType: store.contactModalType,
    setIsContactModalOpen: store.setIsContactModalOpen,
    setSelectedContact: store.setSelectedContact
  }));

  const handleCloseModal = (): void => {
    setIsContactModalOpen(false);
    setSelectedContact(null);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return translateText(["editContactModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (contactModalType) {
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
