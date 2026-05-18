import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import AddCompanyModal from "../../molecules/AddCompanyModal/AddCompanyModal";
import DeleteCompanyConfirmationModal from "../../molecules/DeleteCompanyConfirmationModal/DeleteCompanyConfirmationModal";

const CompanyPopupController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    isCompanyModalOpen,
    crmModalType,
    setIsCompanyModalOpen,
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
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
        return translateText(["deleteCompanyModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (crmModalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return <AddCompanyModal />;
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
        return <DeleteCompanyConfirmationModal />;
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
      className="w-[553px] h-fit"
    />
  );
};

export default CompanyPopupController;
