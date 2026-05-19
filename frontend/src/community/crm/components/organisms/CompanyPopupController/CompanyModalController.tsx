import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddCompanyModal from "../../molecules/AddCompanyModal/AddCompanyModal";

const CompanyModalController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    isAddCompanyModalOpen,
    crmModalType,
    setIsAddCompanyModalOpen
  } = useCrmStore((store) => ({
    isAddCompanyModalOpen: store.isAddCompanyModalOpen,
    crmModalType: store.companyModalType,
    setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen
  }));

  const handleCloseModal = (): void => {
    setIsAddCompanyModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return translateText(["addCompanyModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (crmModalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return <AddCompanyModal />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isAddCompanyModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(crmModalType)}
      content={getModalContent()}
    />
  );
};

export default CompanyModalController;
