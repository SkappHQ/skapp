import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddCompanyModalContent from "~community/crm/v2/components/molecules/AddCompanyModalContent/AddCompanyModalContent";
import DeleteCompanyModalContent from "~community/crm/v2/components/molecules/DeleteCompanyModalContent/DeleteCompanyModalContent";
import EditCompanyModalContent from "~community/crm/v2/components/molecules/EditCompanyModalContent/EditCompanyModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";

const CompanyModalController = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { isCompanyModalOpen, companyModalType, setIsCompanyModalOpen } =
    useCrmStoreV2(
      useShallow((store) => ({
        isCompanyModalOpen: store.isCompanyModalOpen,
        companyModalType: store.companyModalType,
        setIsCompanyModalOpen: store.setIsCompanyModalOpen
      }))
    );

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_COMPANY_MODAL:
        return translateText(["companyModal", "title", "add"]);
      case CrmModalTypes.EDIT_COMPANY_MODAL:
        return translateText(["companyModal", "title", "edit"]);
      case CrmModalTypes.DELETE_COMPANY_MODAL:
        return translateText(["deleteCompanyModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (companyModalType) {
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
      modalHeader={getModalTitle(companyModalType)}
      content={getModalContent()}
    />
  );
};

export default CompanyModalController;
