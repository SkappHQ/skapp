import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddCompanyModalContent from "../../molecules/AddCompanyModalContent/AddCompanyModalContent";
import EditCompanyModalContent from "../../molecules/EditCompanyModalContent/EditCompanyModalContent";
import DeleteCompanyModalContent from "../../molecules/DeleteCompanyModalContent/DeleteCompanyModalContent";

const CompanyModalController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    isCompanyModalOpen,
    crmModalType,
    setIsCompanyModalOpen,
    setSelectedCompany
  } = useCrmStore((store) => ({
    isCompanyModalOpen: store.isCompanyModalOpen,
    crmModalType: store.companyModalType,
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setSelectedCompany: store.setSelectedCompany
  }));

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return translateText(["addCompanyModal", "title"]);
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return translateText(["editCompanyModal", "title"]);
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
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
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
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
