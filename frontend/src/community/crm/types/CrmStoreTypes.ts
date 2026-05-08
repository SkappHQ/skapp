import { CrmModalTypes } from "./ModalTypes";

interface ActionsTypes {
    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
    setCompanyModalType: (companyModalType: CrmModalTypes) => void;
}

export interface CrmStore extends ActionsTypes {
    isAddCompanyModalOpen: boolean;
    companyModalType: CrmModalTypes;
}
