import { CrmModalTypes } from "./ModalTypes";

interface ActionsTypes {
    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
    setCompanyModalType: (companyModalType: CrmModalTypes) => void;
    setCrmModalType: (crmModalType: CrmModalTypes) => void;
    setIsAddContactModalOpen: (isAddContactModalOpen: boolean) => void;
}

export interface CrmStore extends ActionsTypes {
    isAddCompanyModalOpen: boolean;
    companyModalType: CrmModalTypes;
    crmModalType: CrmModalTypes;
    isAddContactModalOpen: boolean;
}
