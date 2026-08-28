import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddContactModalContent from "~community/crm/v2/components/molecules/AddContactModalContent/AddContactModalContent";
import DeleteContactModalContent from "~community/crm/v2/components/molecules/DeleteContactModalContent/DeleteContactModalContent";
import EditContactModalContent from "~community/crm/v2/components/molecules/EditContactModalContent/EditContactModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";

const ContactModalController = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const { isContactModalOpen, contactModalType, setIsContactModalOpen } =
    useCrmStoreV2(
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
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return translateText(["editContactModal", "title"]);
      case CrmModalTypes.DELETE_CONTACT_MODAL:
        return translateText(["deleteContactModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (contactModalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return <AddContactModalContent />;
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return <EditContactModalContent />;
      case CrmModalTypes.DELETE_CONTACT_MODAL:
        return <DeleteContactModalContent />;
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
