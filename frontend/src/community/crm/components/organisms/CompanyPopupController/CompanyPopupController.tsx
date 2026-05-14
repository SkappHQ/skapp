import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddCompanyModal from "../../molecules/AddCompanyModal/AddCompanyModal";

const CompanyPopupController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { isAddCompaniesModalOpen, crmModalType, setIsAddCompanyModalOpen } =
    useCrmStore((store) => ({
      isAddCompaniesModalOpen: store.isAddCompanyModalOpen,
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
        return "Unknown";
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
      isOpen={isAddCompaniesModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(crmModalType)}
      content={getModalContent()}
    />
  );
};

export default CompanyPopupController;
