import { SmallModal } from "@rootcodelabs/skapp-ui";
import { useCrmStore } from "~community/crm/store/crmStore";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import AddCompanyModal from "../../molecules/AddCompanyModal/AddCompanyModal";
import { ReactNode } from "react";

const CompanyPopupController = () => {
    const translateText = useTranslator("crmModule", "popupTitles");

    const {
        isAddCompaniesModalOpen,
        crmModalType,
        setIsAddCompanyModalOpen,
        setCrmModalType
    } = useCrmStore((store) => ({
        isAddCompaniesModalOpen: store.isAddCompanyModalOpen,
        crmModalType: store.crmModalType,
        setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen,
        setCrmModalType: store.setCrmModalType
    }))

    const handleCloseModal = (): void => {
        setIsAddCompanyModalOpen(false);
        setCrmModalType(CrmModalTypes.NONE);
    };

    const getModalTitle = (modalType: CrmModalTypes) => {
        switch (modalType) {
            case CrmModalTypes.ADD_COMPANY_MODAL:
                return translateText(["addCompanyPopup"]);
            default:
                return "Unknown";
        }
    }

    const getModalContent = (): ReactNode => {
        switch (crmModalType) {
            case CrmModalTypes.ADD_COMPANY_MODAL:
                return <AddCompanyModal />
            default:
                return null;
        }
    }

    return (
        <SmallModal
            isOpen={isAddCompaniesModalOpen}
            onClose={handleCloseModal}
            modalHeader={getModalTitle(crmModalType)}
            content={getModalContent()}
        />
    );
}

export default CompanyPopupController;