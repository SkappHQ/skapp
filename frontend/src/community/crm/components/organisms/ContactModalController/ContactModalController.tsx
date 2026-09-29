import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddContactModalContent from "~community/crm/components/molecules/AddContactModalContent/AddContactModalContent";
import DeleteContactModalContent from "~community/crm/components/molecules/DeleteContactModalContent/DeleteContactModalContent";
import EditContactModalContent from "~community/crm/components/molecules/EditContactModalContent/EditContactModalContent";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/CrmTypes";

const ContactModalController: FC = () => {
  const translateText = useTranslator("crmModule");

  const { isContactModalOpen, contactModalType, setIsContactModalOpen } =
    useCrmStore(
      useShallow((state) => ({
        isContactModalOpen: state.isContactModalOpen,
        contactModalType: state.contactModalType,
        setIsContactModalOpen: state.setIsContactModalOpen
      }))
    );

  const handleCloseModal = (): void => {
    setIsContactModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return translateText(["contacts", "modal", "addTitle"]);
      case CrmModalTypes.EDIT_CONTACT_MODAL:
        return translateText(["contacts", "modal", "editTitle"]);
      case CrmModalTypes.DELETE_CONTACT_MODAL:
        return translateText(["contacts", "deleteModal", "title"]);
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
