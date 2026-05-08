import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import CreateContactModal from "~community/crm/components/molecules/CreateContactModal/CreateContactModal";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CrmContactsModalController = () => {
  const translateText = useTranslator("crmModule", "popupTitles");

  const { isAddContactModalOpen, crmModalType, setIsAddContactModalOpen, setCrmModalType } =
    useCrmStore((store) => ({
      isAddContactModalOpen: store.isAddContactModalOpen,
      crmModalType: store.crmModalType,
      setIsAddContactModalOpen: store.setIsAddContactModalOpen,
      setCrmModalType: store.setCrmModalType
    }));

  const handleClose = (): void => {
    setIsAddContactModalOpen(false);
    setCrmModalType(CrmModalTypes.NONE);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return translateText(["addContactPopup"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (crmModalType) {
      case CrmModalTypes.ADD_CONTACT_MODAL:
        return <CreateContactModal />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isAddContactModalOpen}
      onClose={handleClose}
      modalHeader={getModalTitle(crmModalType)}
      backdropVariant="dark"
      className="w-[32rem] max-w-[95vw] !rounded-2xl"
      content={getModalContent()}
    />
  );
};

export default CrmContactsModalController;
