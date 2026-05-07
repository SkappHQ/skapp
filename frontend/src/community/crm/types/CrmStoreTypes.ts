import { CrmModalTypes } from "./ModalTypes";

interface actionsTypes {
    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
    setCompanyModalType: (companyModalType: CrmModalTypes) => void;
}

export interface CrmStore extends actionsTypes {
    isAddCompanyModalOpen: boolean;
    companyModalType: CrmModalTypes;
}
