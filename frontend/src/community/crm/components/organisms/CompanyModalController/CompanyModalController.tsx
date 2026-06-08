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
<<<<<<< HEAD:frontend/src/community/crm/components/organisms/CompanyPopupController/CompanyModalController.tsx
=======
    setSelectedCompany(null);
>>>>>>> 36ba466015e97bcc88046d04efee8523d8895be4:frontend/src/community/crm/components/organisms/CompanyModalController/CompanyModalController.tsx
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return translateText(["addCompanyModal", "title"]);
<<<<<<< HEAD:frontend/src/community/crm/components/organisms/CompanyPopupController/CompanyModalController.tsx
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
=======
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return translateText(["editCompanyModal", "title"]);
      case CrmModalTypes.DELETE_COMPANY_MODAL:
>>>>>>> 36ba466015e97bcc88046d04efee8523d8895be4:frontend/src/community/crm/components/organisms/CompanyModalController/CompanyModalController.tsx
        return translateText(["deleteCompanyModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (modalType: CrmModalTypes): ReactNode => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
<<<<<<< HEAD:frontend/src/community/crm/components/organisms/CompanyPopupController/CompanyModalController.tsx
        return <AddCompanyModal />;
      case CrmModalTypes.DELETE_COMPANY_CONFIRMATION:
        return <DeleteCompanyConfirmationModal />;
=======
        return <AddCompanyModalContent />;
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return <EditCompanyModalContent />;
      case CrmModalTypes.DELETE_COMPANY_MODAL:
        return <DeleteCompanyModalContent />;
>>>>>>> 36ba466015e97bcc88046d04efee8523d8895be4:frontend/src/community/crm/components/organisms/CompanyModalController/CompanyModalController.tsx
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isCompanyModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(crmModalType)}
      content={getModalContent(crmModalType)}
    />
  );
};

export default CompanyModalController;
