import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddCompanyModalContent from "../../molecules/AddCompanyModalContent/AddCompanyModalContent";
import DeleteCompanyModalContent from "../../molecules/DeleteCompanyModalContent/DeleteCompanyModalContent";
import EditCompanyModalContent from "../../molecules/EditCompanyModalContent/EditCompanyModalContent";

const CompanyModalController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    isCompanyModalOpen,
    crmModalType,
    setIsCompanyModalOpen
  } = useCrmStore((store) => ({
    isCompanyModalOpen: store.isCompanyModalOpen,
    crmModalType: store.companyModalType,
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return translateText(["addCompanyModal", "title"]);
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return translateText(["editCompanyModal", "title"]);
      case CrmModalTypes.DELETE_COMPANY_MODAL:
        return translateText(["deleteCompanyModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (crmModalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return <AddCompanyModalContent />;
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return <EditCompanyModalContent />;
      case CrmModalTypes.DELETE_COMPANY_MODAL:
        return <DeleteCompanyModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isCompanyModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(crmModalType)}
      content={getModalContent()}
    />
  );
};

export default CompanyModalController;
